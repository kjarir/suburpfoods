
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function is public and doesn't require authentication
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      }
    });
  }

  try {
    // Use service role key to bypass RLS for admin operations
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

    // Validate required parameters
    if (!token) {
      throw new Error('Missing token parameter');
    }
    if (!orderId) {
      throw new Error('Missing orderId parameter');
    }
    if (!status) {
      throw new Error('Missing status parameter');
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Fetch order and verify token
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, ship_token, status, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Database error fetching order:', orderError);
      throw new Error('Order not found or database error');
    }

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('📦 Found order:', { id: order.id, currentStatus: order.status, hasShipToken: !!order.ship_token });

    // Verify the ship token
    if (order.ship_token !== token) {
      console.error('❌ Token mismatch:', { provided: token, stored: order.ship_token });
      throw new Error('Invalid or expired token');
    }

    // Update order status
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: status,
        ship_token: null, // Clear token after use for security
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Database error updating order:', updateError);
      throw new Error('Failed to update order status');
    }

    console.log('✅ Order status updated successfully:', { orderId, newStatus: status });

    // Return success page
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Updated Successfully</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              max-width: 500px;
              width: 100%;
            }
            .success { 
              color: #4caf50; 
              font-size: 28px; 
              margin-bottom: 20px; 
              font-weight: bold;
            }
            .details { 
              color: #666; 
              font-size: 16px; 
              line-height: 1.6;
            }
            .order-id {
              background: #f5f5f5;
              padding: 10px;
              border-radius: 6px;
              margin: 15px 0;
              font-family: monospace;
              font-weight: bold;
            }
            .status-badge {
              display: inline-block;
              background: #4caf50;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Order Status Updated!</div>
            <div class="details">
              <p>Order <span class="order-id">#${orderId.slice(0, 8)}</span> has been successfully marked as:</p>
              <div class="status-badge">${status.toUpperCase()}</div>
              <p>The customer will be automatically notified of this status change.</p>
              <p><small>This action was completed at ${new Date().toLocaleString()}</small></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new Response(successHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error updating shipping status:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - Order Update Failed</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              max-width: 500px;
              width: 100%;
            }
            .error { 
              color: #f44336; 
              font-size: 28px; 
              margin-bottom: 20px; 
              font-weight: bold;
            }
            .error-details {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #f44336;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Update Failed</div>
            <div class="error-details">
              <p><strong>Error:</strong> ${error.message}</p>
              <p><small>Please check the order details and try again, or contact support if the issue persists.</small></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
      status: 400,
    });
  }
});
