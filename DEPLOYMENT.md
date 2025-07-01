# 🚀 Deploy to Vercel

This project is configured to deploy on Vercel with serverless functions for Razorpay payment processing.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **Razorpay Account**: Live keys configured

## 🛠️ Deployment Steps

### 1. Push to Git Repository

```bash
git add .
git commit -m "Add Vercel serverless functions for Razorpay"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### 3. Environment Variables (Optional)

If you want to use environment variables instead of hardcoded keys:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `RAZORPAY_KEY_ID`: `rzp_live_G8umJgAzBel5Vj`
   - `RAZORPAY_KEY_SECRET`: `LBdExscUN9pRrwuXaX1hpKKC`

Then update the API functions to use:
```javascript
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET,
```

## 🔧 API Endpoints

After deployment, your API endpoints will be available at:

- **Create Order**: `https://your-domain.vercel.app/api/create-razorpay-order`
- **Verify Payment**: `https://your-domain.vercel.app/api/verify-payment`
- **Payment Details**: `https://your-domain.vercel.app/api/payment-details?paymentId=pay_xxx`

## 🧪 Testing

1. **Local Testing**: Run `npm run dev` and test with localhost
2. **Production Testing**: Deploy and test with live Razorpay keys
3. **Payment Flow**:
   - Go to `/razorpay-test` or `/checkout`
   - Enter amount and optional UPI ID
   - Complete payment via Razorpay
   - Verify payment confirmation

## 🔒 Security Features

- ✅ CORS enabled for all origins
- ✅ Input validation
- ✅ Payment signature verification
- ✅ Error handling
- ✅ Rate limiting (Vercel default)

## 📊 Monitoring

- **Vercel Dashboard**: Monitor function execution and errors
- **Razorpay Dashboard**: Monitor payments and transactions
- **Function Logs**: Available in Vercel dashboard

## 🚨 Important Notes

1. **Live Keys**: The project uses live Razorpay keys - real money will be charged
2. **Receipt Length**: Ensure receipt strings are under 40 characters
3. **Amount**: Minimum amount is ₹1 (100 paise)
4. **CORS**: Configured for all origins - restrict in production if needed

## 🔄 Updates

To update the deployment:
```bash
git add .
git commit -m "Update payment functions"
git push origin main
# Vercel will auto-deploy
```

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Razorpay Docs**: [razorpay.com/docs](https://razorpay.com/docs)
- **Project Issues**: Check GitHub repository 