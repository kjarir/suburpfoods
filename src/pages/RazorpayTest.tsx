
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create order via Edge Function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 100, // ₹1.00 for testing
          currency: 'INR',
          receipt: `test_${Date.now()}`,
        }
      });

      if (error) throw error;

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Subburpfood',
        description: 'Test Payment',
        order_id: data.id,
        handler: function (response: any) {
          toast({
            title: "Payment Successful!",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          console.log('Payment successful:', response);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>Razorpay Payment Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This is a test page for Razorpay integration. Click the button below to test a payment of ₹1.00.</p>
            
            <Button 
              onClick={handlePayment} 
              disabled={loading || !user}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Pay ₹1.00'}
            </Button>
            
            {!user && (
              <p className="text-sm text-gray-600">Please sign in to test payments.</p>
            )}
            
            <div className="text-xs text-gray-500 mt-4">
              <p><strong>Test Card Details:</strong></p>
              <p>Card Number: 4111 1111 1111 1111</p>
              <p>Expiry: Any future date</p>
              <p>CVV: Any 3 digits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
      
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default RazorpayTest;
