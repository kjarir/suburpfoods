import crypto from 'crypto';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
        received: { razorpay_order_id, razorpay_payment_id, razorpay_signature: razorpay_signature ? '***' : undefined }
      });
    }

    console.log('Verifying payment for order:', razorpay_order_id);

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', 'LBdExscUN9pRrwuXaX1hpKKC')
      .update(text)
      .digest('hex');
    
    console.log('Generated signature:', signature);
    console.log('Received signature:', razorpay_signature);

    if (razorpay_signature !== signature) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({ 
        error: 'Payment signature verification failed',
        expected: signature,
        received: razorpay_signature
      });
    }

    console.log('✅ Payment signature verified successfully');

    res.status(200).json({ 
      verified: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 