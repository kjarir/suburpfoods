import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = 'https://bxexpxnknhkgnihnumgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXhwc3huc2hrZ25paG51bWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzE5NzQsImV4cCI6MjA1MTU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunctions() {
  console.log('🧪 Testing Edge Functions...\n');

  try {
    // Test 1: Create Razorpay Order
    console.log('1️⃣ Testing create-razorpay-order...');
    const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        receipt: 'test_receipt_123',
      },
    });

    if (razorpayError) {
      console.error('❌ Razorpay order creation failed:', razorpayError);
    } else {
      console.log('✅ Razorpay order created:', razorpayOrder.id);
    }

    // Test 2: Check if we can access orders (this will help verify RLS)
    console.log('\n2️⃣ Testing database access...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .limit(5);

    if (ordersError) {
      console.error('❌ Database access failed:', ordersError);
    } else {
      console.log('✅ Database access successful, found', orders?.length || 0, 'orders');
    }

    console.log('\n✅ Edge Functions test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEdgeFunctions(); 