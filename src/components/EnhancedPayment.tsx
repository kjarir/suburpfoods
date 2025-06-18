
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Building, Wallet, Shield, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
}

const EnhancedPayment: React.FC<PaymentProps> = ({ amount, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleUPIPayment = () => {
    if (!upiId || !upiId.includes('@')) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive"
      });
      return;
    }

    // Simulate UPI payment
    toast({
      title: "UPI Payment Initiated",
      description: "Please complete the payment on your UPI app"
    });

    setTimeout(() => {
      onPaymentSuccess(`upi_${Date.now()}`);
    }, 2000);
  };

  const handleCardPayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast({
        title: "Incomplete Card Details",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    // Simulate card payment
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your payment"
    });

    setTimeout(() => {
      onPaymentSuccess(`card_${Date.now()}`);
    }, 3000);
  };

  const handleNetBankingPayment = () => {
    toast({
      title: "Redirecting to Bank",
      description: "You will be redirected to your bank's website"
    });

    setTimeout(() => {
      onPaymentSuccess(`nb_${Date.now()}`);
    }, 2000);
  };

  const handleWalletPayment = () => {
    toast({
      title: "Wallet Payment",
      description: "Processing wallet payment"
    });

    setTimeout(() => {
      onPaymentSuccess(`wallet_${Date.now()}`);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Secure Payment - ₹{amount.toFixed(2)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upi" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              UPI
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="netbanking" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              NetBanking
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUPIPayment} className="flex-1">
                Pay with UPI
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Popular UPI apps: PhonePe, Google Pay, Paytm, BHIM
            </div>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={handleCardPayment} className="w-full">
              Pay with Card
            </Button>
          </TabsContent>

          <TabsContent value="netbanking" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Select Your Bank</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbi">State Bank of India</SelectItem>
                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                  <SelectItem value="icici">ICICI Bank</SelectItem>
                  <SelectItem value="axis">Axis Bank</SelectItem>
                  <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                  <SelectItem value="other">Other Banks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleNetBankingPayment} className="w-full">
              Pay with NetBanking
            </Button>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleWalletPayment}>
                Paytm Wallet
              </Button>
              <Button variant="outline" onClick={handleWalletPayment}>
                PhonePe
              </Button>
              <Button variant="outline" onClick={handleWalletPayment}>
                Amazon Pay
              </Button>
              <Button variant="outline" onClick={handleWalletPayment}>
                Mobikwik
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-4 w-4" />
          <span>256-bit SSL encrypted</span>
          <Star className="h-4 w-4" />
          <span>PCI DSS compliant</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPayment;
