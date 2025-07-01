'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('1.00');

  // Load Razorpay script dynamically (safe for SSR)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You must be signed in to make a payment.", variant: "destructive" });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Amount must be greater than 0.", variant: "destructive" });
      return;
    }

    if (upiId && !upiId.includes('@')) {
      toast({ title: "Invalid UPI ID", description: "Enter a valid UPI ID like name@bank.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order in Supabase
      const orderData = {
        user_id: user.id,
        total_amount: parseFloat(amount),
        status: 'pending' as const,
        payment_status: 'pending' as const,
        shipping_address: {
          name: user.user_metadata?.first_name || 'Test User',
          email: user.email,
          phone: '',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 2: Create Razorpay Order via Supabase Edge Function
      const { data: razorpayOrder, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: Math.round(parseFloat(amount) * 100),
          currency: 'INR',
          receipt: `order_${order.id}`.substring(0, 40),
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      // Step 3: Update Supabase order with Razorpay order ID
      await supabase.from('orders')
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq('id', order.id);

      // Step 4: Initialize Razorpay Checkout
      const rzp = new window.Razorpay({
        key: 'rzp_live_G8umJgAzBel5Vj',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SuBurp Foods',
        description: `Order #${order.id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user.user_metadata?.first_name || user.email?.split('@')[0],
          email: user.email,
          contact: user.user_metadata?.phone || '',
          method: upiId ? 'upi' : undefined,
          vpa: upiId || undefined,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }]
              },
              other: {
                name: "Other Methods",
                instruments: [{ method: "card" }, { method: "netbanking" }]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: { show_default_blocks: false }
          }
        },
        handler: async function (response: any) {
          try {
            // Step 5: Verify payment via Supabase Edge Function
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: razorpayOrder.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id,
              },
              headers: {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
            });

            if (verifyError || !verifyData.verified) {
              throw new Error(verifyError?.message || "Payment verification failed.");
            }

            // Payment verified - update order status
            await supabase.from('orders').update({
              status: 'confirmed',
              payment_status: 'completed',
              payment_id: response.razorpay_payment_id
            }).eq('id', order.id);

            toast({
              title: "✅ Payment Successful",
              description: `Order #${order.id} confirmed. Payment ID: ${response.razorpay_payment_id}`
            });
          } catch (error: any) {
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
        },
        theme: {
          color: '#000000'
        }
      });

      rzp.on('payment.failed', (response: any) => {
        toast({
          title: "❌ Payment Failed",
          description: response.error?.description || "Transaction was unsuccessful.",
          variant: "destructive",
        });
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>Razorpay Live Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            

            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="upiId">UPI ID (optional)</Label>
              <Input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
              />
              <p className="text-xs text-gray-500 mt-1">If provided, Razorpay will autofill this UPI ID</p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || !user}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : `Pay ₹${amount}`}
            </Button>

            {!user && <p className="text-sm text-red-500 mt-2">Sign in to enable payment.</p>}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default RazorpayTest;
