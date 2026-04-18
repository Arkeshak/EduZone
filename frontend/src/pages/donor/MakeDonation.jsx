/**
 * MAKE DONATION PAGE
 * 
 * File Purpose: Multi-step donation form for donors
 * Used for: Processing donations to specific welfare requests or general donations
 * 
 * Features:
 * - Step 1: Select amount (preset or custom)
 * - Step 2: Choose allocation (specific request or general)
 * - Step 3: Select payment method (Online or Bank Transfer)
 * - Step 4: Upload receipt/proof (for bank transfers)
 * - Confirmation and success message
 * 
 * URL parameters:
 * - requestId: Pre-select welfare request to fund
 * - amount: Pre-fill donation amount
 * - description: Pre-fill request description
 * 
 * Flow: Select amount → Choose request/general → Payment method → Upload proof (if needed) → Confirm → Submit
 */

import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Wallet, Heart, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUploader from '@/components/FileUploader';
import client from '@/services/apiClient';

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
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [receiptFile, setReceiptFile] = useState(null);
  const receiptRef = useRef();

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current.innerHTML;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Donation Receipt - Eduzone</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; pb: 20px; margin-bottom: 30px; }
            .header h1 { color: #1e3a8a; margin: 0; font-size: 28px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .label { font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 12px; }
            .value { font-weight: 800; }
            .amount-box { background: #eff6ff; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #bfdbfe; }
            .amount { font-size: 32px; font-weight: 900; color: #2563eb; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
            .seal { border: 3px solid #10b981; color: #10b981; display: inline-block; padding: 10px 20px; border-radius: 50%; font-weight: 900; transform: rotate(-15deg); margin-top: 20px; opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            ${printContent}
            <div style="text-align: center;">
              <div class="seal">VERIFIED</div>
            </div>
            <div class="footer">
              <p>This is an electronically generated receipt for Eduzone Welfare System.</p>
              <p>&copy; 2024 Hatton Zonal Education Office</p>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
  };

  const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

  const handleDonate = async () => {
    const finalAmount = amount === 'custom' ? customAmount : amount;

    if (!finalAmount) {
      toast.error("Please select or enter a donation amount.");
      return;
    }

    if (paymentMethod === 'Bank Transfer' && !receiptFile) {
      toast.error("Please upload the bank transfer receipt.");
      return;
    }

    setLoading(true);

    try {
      const numericAmount = parseFloat(finalAmount.toString().replace(/,/g, ''));
      const isAnonymous = document.getElementById('anonymous')?.checked || false;

      // Use FormData if sending file
      const formData = new FormData();
      formData.append('amount', numericAmount);
      formData.append('description', paramDesc || 'General Donation');
      formData.append('allocation', allocation);
      formData.append('isAnonymous', isAnonymous);
      
      const standardizedPaymentMethod = paymentMethod === 'Online' ? 'ONLINE' : 'BANK_TRANSFER';
      formData.append('paymentMethod', standardizedPaymentMethod);

      if (requestId) {
        formData.append('welfareRequestId', requestId);
      }

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await client.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      toast.success("Thank you! Your donation has been processed.");
    } catch (error) {
      console.error(error);
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
            {paymentMethod === 'Bank Transfer' ? (
              <p className="text-gray-500 mt-1">Your receipt has been uploaded for verification.</p>
            ) : (
              <p className="text-gray-500 mt-1">A receipt has been sent to your email.</p>
            )}
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => window.location.href = '/donor/browse-requests'}>Browse More Requests</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handlePrintReceipt}>Download Receipt</Button>
          </div>

          {/* Hidden Receipt for Printing */}
          <div className="hidden">
            <div ref={receiptRef}>
              <div className="header">
                <img src="/logo.png" alt="Eduzone" style={{ height: '40px', marginBottom: '10px' }} />
                <h1>OFFICIAL DONATION RECEIPT</h1>
              </div>
              <div className="details">
                <div className="row">
                  <span className="label">Reference ID</span>
                  <span className="value">{searchParams.get('ref') || `EDZ-${Date.now()}`}</span>
                </div>
                <div className="row">
                  <span className="label">Date</span>
                  <span className="value">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="row">
                  <span className="label">Donor Name</span>
                  <span className="value">{document.getElementById('anonymous')?.checked ? 'Anonymous' : 'Verified Donor'}</span>
                </div>
                <div className="row">
                  <span className="label">Allocation</span>
                  <span className="value">{paramSchool || 'General Welfare Fund'}</span>
                </div>
              </div>
              <div className="amount-box">
                <p className="label">Total Amount Contributed</p>
                <p className="amount">LKR {Number(amount === 'custom' ? customAmount : amount).toLocaleString()}</p>
              </div>
              <p style={{ fontSize: '14px', textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>
                Thank you for your generous contribution towards student education in Hatton Zone.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* Guard: Only allow donations with Request ID */
  if (!requestId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="p-6 bg-red-50 rounded-full">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Select a Cause</h2>
          <p className="text-gray-600 max-w-md">Please browse the verified welfare requests and select a specific student/cause to support.</p>
          <Button onClick={() => window.location.href = '/donor/browse-requests'} className="bg-blue-600">
            Browse Requests
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Complete Your Donation</h1>
          <p className="text-gray-600">You are supporting a verified student request.</p>
        </div>

        {requestId && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Heart className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Ref ID: <span className="font-semibold">{searchParams.get('ref') || `#${requestId}`}</span>
                </p>
                {paramSchool && <p className="text-xs text-blue-600 mt-1">School: {paramSchool}</p>}
              </div>
            </div>
          </div>
        )}

        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader>
            <CardTitle>Donation Amount (LKR)</CardTitle>
            <CardDescription>Confirm the amount to fund this request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Amount Selection */}
            <div className="pt-4">
              {/* Logic to lock amount to request cost if needed, but user might partial fund. Allowing edit is fine. */}
              <div className="flex items-center space-x-2">
                <Label className="font-semibold text-lg">Amount to Donate:</Label>
              </div>
              <div className="mt-3 max-w-sm relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="pl-12 text-lg font-bold"
                  value={amount === 'custom' ? customAmount : amount}
                  onChange={(e) => {
                    setAmount('custom');
                    setCustomAmount(e.target.value);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Target Amount: LKR {Number(paramAmount).toLocaleString()}</p>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <RadioGroupItem value="Online" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer w-full">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium block">Credit / Debit Card</span>
                      <span className="text-xs text-gray-500">Visa, Mastercard, Amex</span>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer ${paymentMethod === 'Bank Transfer' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <RadioGroupItem value="Bank Transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center cursor-pointer w-full">
                    <Wallet className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium block">Bank Transfer</span>
                      <span className="text-xs text-gray-500">Manual verification required</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Bank Transfer Details & Upload */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-2 animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-semibold text-sm mb-2 text-slate-700">Bank Account Details</h4>
                  <div className="text-sm text-slate-600 space-y-1 mb-4">
                    <p>Bank: <span className="font-medium">Bank of Ceylon</span></p>
                    <p>Account Name: <span className="font-medium">Hatton Zonal Education Office</span></p>
                    <p>Account Number: <span className="font-medium">1234-5678-9012</span></p>
                    <p>Branch: <span className="font-medium">Hatton</span></p>
                  </div>

                  <FileUploader
                    id="receipt"
                    label="Upload Receipt (Image/PDF)"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    file={receiptFile}
                    helperText="Please upload the confirmation slip or screenshot."
                  />
                </div>
              )}
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
                  <Heart className="w-5 h-5 mr-2" /> {paymentMethod === 'Bank Transfer' ? 'Submit Donation' : 'Donate Now'}
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
