import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Checkbox } from '@/app/components/ui/checkbox';
import { CreditCard, Wallet, Heart, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import client from '@/api/client';

const MakeDonation = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const paramAmount = searchParams.get('amount');
  const paramDesc = searchParams.get('description');
  const paramSchool = searchParams.get('school');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(paramAmount ? 'custom' : '');
  const [customAmount, setCustomAmount] = useState(paramAmount || '');
  const [allocation, setAllocation] = useState(requestId ? 'specific' : 'general');

  const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

  const handleDonate = async () => {
    const finalAmount = amount === 'custom' ? customAmount : amount;

    if (!finalAmount) {
      toast.error("Please select or enter a donation amount.");
      return;
    }

    setLoading(true);

    try {
      const finalAmount = amount === 'custom' ? customAmount : amount;
      const numericAmount = parseFloat(finalAmount.toString().replace(/,/g, ''));

      await client.post('/donations', {
        amount: numericAmount,
        description: paramDesc || 'General Donation',
        allocation: allocation,
        isAnonymous: document.getElementById('anonymous')?.checked || false
      });

      setSuccess(true);
      toast.success("Thank you! Your donation has been processed.");
    } catch (error) {
      toast.error("Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
            <p className="text-xl text-gray-600 mt-2">Your contribution of LKR {amount === 'custom' ? customAmount : amount} has been received.</p>
            <p className="text-gray-500 mt-1">A receipt has been sent to your email.</p>
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => { setSuccess(false); setStep(1); setAmount(''); }}>Make Another Donation</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Download Receipt</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Make a Donation</h1>
          <p className="text-gray-600">Your contribution helps shape the future of students in Hatton Zone.</p>
        </div>

        {requestId && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Heart className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are funding a specific request: <span className="font-semibold">{paramDesc}</span> for <span className="font-semibold">{paramSchool}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader>
            <CardTitle>Select Donation Amount (LKR)</CardTitle>
            <CardDescription>Choose an amount or enter your own</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Amount Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => { setAmount(val); setCustomAmount(''); }}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${amount === val ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'hover:bg-gray-50 border-gray-200'}`}
                >
                  <span className="text-lg font-bold">{val.toLocaleString()}</span>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-2">
                <RadioGroup value={amount === 'custom' ? 'custom' : 'preset'} onValueChange={() => setAmount('custom')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-medium cursor-pointer">Enter Custom Amount</Label>
                  </div>
                </RadioGroup>
              </div>
              {amount === 'custom' && (
                <div className="mt-3 ml-6 max-w-sm relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-12"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Donation Type & Allocation */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Allocation Preference</Label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select where to allocate funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Revolving Fund (General Pool)</SelectItem>
                  <SelectItem value="books">Books & Stationery</SelectItem>
                  <SelectItem value="uniforms">Uniforms & Shoes</SelectItem>
                  <SelectItem value="infrastructure">School Infrastructure</SelectItem>
                  <SelectItem value="specific">Specific Request (Browse Requests)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                * General Pool funds are allocated by the ZEO based on urgent needs.
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Payment Method</Label>
              <RadioGroup defaultValue="card" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 border p-4 rounded-lg has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer w-full">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium block">Credit / Debit Card</span>
                      <span className="text-xs text-gray-500">Visa, Mastercard, Amex</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-lg has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 cursor-pointer">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center cursor-pointer w-full">
                    <Wallet className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium block">Bank Transfer</span>
                      <span className="text-xs text-gray-500">Manual verification required</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Privacy */}
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox id="anonymous" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="anonymous" className="font-medium cursor-pointer">
                  Make this donation anonymous
                </Label>
                <p className="text-sm text-gray-500">
                  Your name will not be displayed in public donation logs.
                </p>
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end p-6 rounded-b-lg">
            <Button
              size="lg"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
              onClick={handleDonate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" /> Donate Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MakeDonation;
