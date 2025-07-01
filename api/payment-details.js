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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;

    // Validate payment ID
    if (!paymentId) {
      return res.status(400).json({ 
        error: 'Payment ID is required',
        usage: '/api/payment-details?paymentId=pay_xxx'
      });
    }

    console.log('Fetching payment details for:', paymentId);

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    console.log('✅ Payment details fetched successfully');

    res.status(200).json(payment);

  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    
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