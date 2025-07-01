'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to complete your order",
        variant: "destructive"
      });
      return;
    }

    // Validate shipping information
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all shipping details",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order in database with pending status
      const orderData = {
        user_id: user.id,
        total_amount: total * 1.1, // Including tax
        status: 'pending' as const,
        payment_status: 'pending' as const,
        shipping_address: shippingInfo
      };

      console.log('📝 Creating order in database:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Database order creation failed:', orderError);
        throw orderError;
      }

      console.log('✅ Order created in database:', order.id);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('📦 Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items creation failed:', itemsError);
        throw itemsError;
      }

      console.log('✅ Order items created successfully');

      // Step 2: Create Razorpay order using Supabase Edge Functions
      const amountInPaise = Math.round((total * 1.1) * 100); // Convert to paise
      
      // Ensure minimum amount (₹1 = 100 paise)
      if (amountInPaise < 100) {
        toast({
          title: "Invalid Amount",
          description: "Minimum amount is ₹1",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const razorpayOrderData = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `order_${order.id}`.substring(0, 40), // Truncate to 40 chars for Razorpay
      };

      let razorpayOrder;
      
      try {
        // Create order using Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
          body: razorpayOrderData,
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) {
          console.error('❌ Supabase Function Error:', error);
          console.error('❌ Error Details:', JSON.stringify(error, null, 2));
          throw new Error(error.message || 'Failed to create Razorpay order');
        }

        razorpayOrder = data;
        console.log('✅ Razorpay order created:', razorpayOrder);
        
      } catch (error) {
        console.error('❌ Razorpay order creation failed:', error);
        toast({
          title: "❌ Payment Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Step 3: Update order with Razorpay order ID
      console.log('📝 Updating order with razorpay_order_id:', razorpayOrder.id);
      
      const { error: updateError } = await supabase.from('orders')
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq('id', order.id);
        
      if (updateError) {
        console.error('❌ Failed to update order with razorpay_order_id:', updateError);
        throw updateError;
      }
      
      console.log('✅ Order updated with razorpay_order_id successfully');

      // Step 4: Initialize Razorpay payment
      const rzp = new window.Razorpay({
        key: 'rzp_live_G8umJgAzBel5Vj',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SuBurp Foods',
        description: `Order #${order.id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        notes: {
          order_id: order.id,
          customer_id: user.id
        },
        theme: {
          color: '#000000'
        },
        handler: async function (response: any) {
          try {
            console.log('Payment successful:', response);
            
            // Step 5: Verify payment with Supabase Edge Function
            const verifyPayload = {
              razorpay_order_id: razorpayOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
            };
            
            console.log('🔍 Sending verification payload:', verifyPayload);
            
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: verifyPayload,
              headers: {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
            });

            if (verifyError || !verifyData.verified) {
              throw new Error(verifyError?.message || 'Payment verification failed');
            }

            console.log('✅ Payment verified successfully:', verifyData);

            // Payment verified - update order status to confirmed
            const { error: updateError } = await supabase.from('orders').update({
              status: 'confirmed',
              payment_status: 'completed',
              payment_id: response.razorpay_payment_id
            }).eq('id', order.id);

            if (updateError) {
              console.error('❌ Order status update failed:', updateError);
              throw updateError;
            }

            console.log('✅ Order status updated to confirmed');

            // Clear cart after successful order
            clearCart();
            
            toast({
              title: "✅ Order Confirmed!",
              description: `Your order #${order.id.slice(0, 8)} has been placed successfully.`
            });

            // Navigate to order tracking page
            navigate(`/track-order/${order.id}`);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "❌ Payment Verification Failed",
              description: error.message,
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Razorpay modal dismissed');
          }
        }
      });

      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        toast({
          title: "❌ Payment Failed",
          description: response.error?.description || "Transaction was unsuccessful.",
          variant: "destructive",
        });
        setLoading(false);
      });

      console.log('Opening Razorpay with order:', razorpayOrder);
      rzp.open();

    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary and Payment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image && item.image.trim() !== '' ? item.image : '/placeholder.svg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{(total * 0.1).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{(total * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Card>
              <CardContent className="pt-6">
                
                <Button 
                  onClick={handlePayment} 
                  disabled={loading || !user}
                  className="w-full bg-gray-900 hover:bg-green-700 mb-2"
                >
                  {loading ? 'Processing Payment...' : `Pay ₹${(total * 1.1).toFixed(2)}`}
                </Button>

                {/* Test Mode Button for Development */}
                {/* <Button 
                  onClick={async () => {
                    if (!user) {
                      toast({
                        title: "Authentication required",
                        description: "Please login to complete your order",
                        variant: "destructive"
                      });
                      return;
                    }

                    setLoading(true);
                    
                    try {
                      // Test: Direct Razorpay API call (for debugging)
                      console.log('🧪 Testing direct Razorpay API call...');
                      
                      const testOrderData = {
                        amount: 100, // ₹1
                        currency: 'INR',
                        receipt: 'test_order_123',
                      };

                      const authString = btoa('rzp_live_G8umJgAzBel5Vj:LBdExscUN9pRrwuXaX1hpKKC');
                      
                      const response = await fetch('https://api.razorpay.com/v1/orders', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Basic ${authString}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(testOrderData),
                      });

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error('❌ Direct API Error:', errorText);
                        throw new Error(`Direct API failed: ${errorText}`);
                      }

                      const testOrder = await response.json();
                      console.log('✅ Direct API Success:', testOrder);
                      
                      toast({
                        title: "✅ Direct API Test Success",
                        description: `Test order created: ${testOrder.id}`,
                      });

                    } catch (error: any) {
                      console.error('❌ Direct API Test Error:', error);
                      toast({
                        title: "❌ Direct API Test Failed",
                        description: error.message,
                        variant: "destructive"
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !user}
                  variant="outline"
                  className="w-full mb-2"
                >
                  🧪 Test Direct Razorpay API
                </Button> */}
                
                {!user && (
                  <p className="text-sm text-red-500 mt-2 text-center">Please sign in to complete your order</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;