import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      throw new Error('Missing required payment verification parameters');
    }

    // Use hardcoded LIVE Razorpay credentials
    const keySecret = 'LBdExscUN9pRrwuXaX1hpKKC'; // Your actual live secret key
    const keyId = 'rzp_live_G8umJgAzBel5Vj'; // Your live key ID

    if (!keySecret || !keyId) {
      throw new Error('Razorpay LIVE credentials not configured');
    }

    // Ensure we're using live keys
    if (!keyId.startsWith('rzp_live_')) {
      throw new Error('Please configure LIVE Razorpay keys for production payments');
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(text);
    const key = encoder.encode(keySecret);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToVerify);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    // Compare signatures
    if (razorpay_signature !== expectedSignature) {
      throw new Error('Payment signature verification failed');
    }

    // Verify payment with Razorpay API
    const authString = btoa(`${keyId}:${keySecret}`);
    
    const response = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Razorpay API error: ${errorData}`);
    }

    const paymentData = await response.json();

    // Check if payment is successful
    if (paymentData.status !== 'captured') {
      throw new Error(`Payment not successful. Status: ${paymentData.status}`);
    }

    // Verify order ID matches
    if (paymentData.order_id !== razorpay_order_id) {
      throw new Error('Order ID mismatch');
    }

    // Verify amount matches our order
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .select('total_amount, razorpay_order_id')
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw new Error('Order not found');
    }

    if (orderData.razorpay_order_id !== razorpay_order_id) {
      throw new Error('Order ID verification failed');
    }

    // Convert our amount to paise for comparison
    const expectedAmount = Math.round(orderData.total_amount * 100);
    if (paymentData.amount !== expectedAmount) {
      throw new Error(`Amount mismatch. Expected: ${expectedAmount}, Got: ${paymentData.amount}`);
    }

    return new Response(
      JSON.stringify({
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: order_id,
        amount: paymentData.amount,
        status: paymentData.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 