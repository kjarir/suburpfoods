// Test script to check database schema
// Run this with: node test-db-schema.js

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://bxexpxnknhkgnihnumgh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXhweG5rbmhnbmlobnVtZ2giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU5NzI5NCwiZXhwIjoyMDUwMTczMjk0fQ.8f955c7c-9dec-4478-b8bd-f4d32c715e48';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...\n');

  try {
    // Test 1: Check if orders table exists and has the right columns
    console.log('1. Checking orders table structure...');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Error accessing orders table:', ordersError);
      return;
    }
    
    console.log('✅ Orders table accessible');
    
    // Test 2: Check recent orders to see the structure
    console.log('\n2. Checking recent orders...');
    
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, razorpay_order_id, total_amount, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('❌ Error fetching recent orders:', recentError);
      return;
    }
    
    console.log('📋 Recent orders:');
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ID: ${order.id.slice(0, 8)}... | Razorpay ID: ${order.razorpay_order_id || 'NULL'} | Amount: ₹${order.total_amount} | Status: ${order.status} | Payment: ${order.payment_status}`);
    });
    
    // Test 3: Check if order_items table exists
    console.log('\n3. Checking order_items table...');
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.error('❌ Error accessing order_items table:', itemsError);
    } else {
      console.log('✅ Order_items table accessible');
    }
    
    // Test 4: Check products table
    console.log('\n4. Checking products table...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Error accessing products table:', productsError);
    } else {
      console.log('✅ Products table accessible');
      console.log('📦 Sample products:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ₹${product.price} - Image: ${product.image ? 'Yes' : 'No'}`);
      });
    }
    
    console.log('\n✅ Database schema test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabaseSchema(); 