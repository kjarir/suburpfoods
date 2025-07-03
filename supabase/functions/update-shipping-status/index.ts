
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const orderId = url.searchParams.get('orderId');
    const status = url.searchParams.get('status');

    console.log('🚚 Updating shipping status:', { orderId, status, hasToken: !!token });

    if (!token || !orderId || !status) {
      throw new Error('Missing required parameters');
    }

    // Verify token
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, ship_token, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (order.ship_token !== token) {
      throw new Error('Invalid token');
    }

    // Update order status
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: status,
        ship_token: null // Clear token after use
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error('Failed to update order status');
    }

    console.log('✅ Order status updated successfully');

    // Return success page
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Updated</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4caf50; font-size: 24px; margin-bottom: 20px; }
            .details { color: #666; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="success">✅ Order Status Updated!</div>
          <div class="details">
            <p>Order #${orderId.slice(0, 8)} has been marked as <strong>${status}</strong>.</p>
            <p>The customer will be notified of this status change.</p>
          </div>
        </body>
      </html>
    `;

    return new Response(successHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error updating shipping status:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="error">❌ Error: ${error.message}</div>
        </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
      status: 400,
    });
  }
});
