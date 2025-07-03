
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { OrderConfirmationEmail } from "./_templates/order-confirmation.tsx";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { orderId } = await req.json();

    console.log('📧 Sending order confirmation emails for order:', orderId);

    // Fetch order details with items and customer info
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price)
        ),
        profiles (first_name, last_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError);
      throw new Error('Order not found');
    }

    console.log('📦 Order data fetched:', order.id);

    // Generate secure token for shipping status update
    const encoder = new TextEncoder();
    const data = encoder.encode(`${orderId}${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const shipToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store the token in database for verification
    const { error: tokenError } = await supabaseClient
      .from('orders')
      .update({ ship_token: shipToken })
      .eq('id', orderId);

    if (tokenError) {
      console.error('❌ Error storing ship token:', tokenError);
    }

    const customerName = `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || 'Customer';
    const customerEmail = order.profiles?.email;

    const orderItems = order.order_items.map((item: any) => ({
      name: item.products.name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const shippingAddress = order.shipping_address as any;

    // Render customer email
    const customerEmailHtml = await renderAsync(
      React.createElement(OrderConfirmationEmail, {
        customerName,
        orderId: order.id,
        orderItems,
        totalAmount: Number(order.total_amount),
        shippingAddress,
        isAdminEmail: false,
      })
    );

    // Render admin email
    const adminEmailHtml = await renderAsync(
      React.createElement(OrderConfirmationEmail, {
        customerName,
        orderId: order.id,
        orderItems,
        totalAmount: Number(order.total_amount),
        shippingAddress,
        isAdminEmail: true,
        shipToken,
      })
    );

    const emails = [];

    // Send to customer if email exists
    if (customerEmail) {
      emails.push({
        from: 'SuBurp Foods <orders@resend.dev>',
        to: [customerEmail],
        subject: `Order Confirmation - #${order.id.slice(0, 8)}`,
        html: customerEmailHtml,
      });
    }

    // Send to admins
    const adminEmails = ['kjarir23@gmail.com', 'maariaahmed637@gmail.com'];
    emails.push({
      from: 'SuBurp Foods <orders@resend.dev>',
      to: adminEmails,
      subject: `🔔 New Order Received - #${order.id.slice(0, 8)}`,
      html: adminEmailHtml,
    });

    // Send all emails
    const emailPromises = emails.map(email => resend.emails.send(email));
    const results = await Promise.allSettled(emailPromises);

    console.log('📧 Email results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: results.filter(r => r.status === 'fulfilled').length,
        totalEmails: results.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in send-order-confirmation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
