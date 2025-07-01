import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    const { amount, currency = 'INR', receipt } = await req.json();

    // Use hardcoded LIVE Razorpay credentials
    const keyId = 'rzp_live_G8umJgAzBel5Vj'; // Your live key ID
    const keySecret = 'LBdExscUN9pRrwuXaX1hpKKC'; // Your actual live secret key

    if (!keyId || !keySecret) {
      throw new Error('Razorpay LIVE credentials not configured');
    }

    // Ensure we're using live keys (should start with rzp_live_)
    if (!keyId.startsWith('rzp_live_')) {
      throw new Error('Please configure LIVE Razorpay keys for production payments');
    }

    // Create Razorpay order
    const orderData = {
      amount: amount, // Amount is already in paise from frontend
      currency,
      receipt,
    };

    const authString = btoa(`${keyId}:${keySecret}`);
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Razorpay API error: ${errorData}`);
    }

    const order = await response.json();

    return new Response(
      JSON.stringify({
        ...order,
        key_id: keyId, // Include live key_id for frontend
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Create order error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 