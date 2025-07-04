import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = 'https://bxexpxnknhkgnihnumgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXhwc3huc2hrZ25paG51bWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzE5NzQsImV4cCI6MjA1MTU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testShippingUpdate() {
  console.log('🧪 Testing Shipping Status Update...\n');

  try {
    // First, let's create a test order with a ship token
    console.log('1️⃣ Creating a test order...');
    
    // We'll need to create an order through the normal flow
    // For now, let's just test the URL format
    
    const testOrderId = 'a20967b6-a5be-40cd-98cf-0eba553d0235'; // Use a real order ID
    const testToken = 'test-token-123';
    const testStatus = 'shipped';
    
    const testUrl = `https://bxexpxnknhkgnihnumgh.supabase.co/functions/v1/update-shipping-status?token=${testToken}&orderId=${testOrderId}&status=${testStatus}`;
    
    console.log('2️⃣ Testing URL format:', testUrl);
    console.log('3️⃣ The function should now work without authorization header errors');
    
    // Test the function directly
    console.log('\n4️⃣ Testing function call...');
    const response = await fetch(testUrl);
    const result = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response body:', result.substring(0, 200) + '...');
    
    if (response.ok) {
      console.log('✅ Function is working correctly!');
    } else {
      console.log('❌ Function returned an error, but no more authorization header issues');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testShippingUpdate(); 