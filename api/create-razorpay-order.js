import Razorpay from 'razorpay';

// Initialize Razorpay with your live keys
const razorpay = new Razorpay({
  key_id: 'rzp_live_G8umJgAzBel5Vj',
  key_secret: 'LBdExscUN9pRrwuXaX1hpKKC'
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    // Validate required parameters
    if (!amount || !currency || !receipt) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['amount', 'currency', 'receipt'],
        received: { amount, currency, receipt }
      });
    }

    // Validate amount (must be in paise)
    if (amount < 100) { // Minimum ₹1
      return res.status(400).json({ 
        error: 'Amount must be at least 100 paise (₹1)',
        received: amount
      });
    }

    // Create Razorpay order
    const orderData = {
      amount: amount,
      currency: currency,
      receipt: receipt,
    };

    console.log('Creating Razorpay order with data:', orderData);

    const order = await razorpay.orders.create(orderData);
    
    console.log('✅ Razorpay order created successfully:', order.id);

    res.status(200).json(order);

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    
    // Handle specific Razorpay errors
    if (error.error) {
      return res.status(400).json({ 
        error: error.error.description || 'Razorpay API error',
        code: error.error.code,
        details: error.error
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 