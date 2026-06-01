import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout'; // Standard page layout
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // UI Library
import { Button } from '@/components/ui/button'; // UI Library
import { Input } from '@/components/ui/input'; // UI Library
import { Label } from '@/components/ui/label'; // UI Library
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // UI Library
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // UI Library
import { Checkbox } from '@/components/ui/checkbox'; // UI Library
import { CreditCard, Wallet, Heart, CheckCircle2, Upload } from 'lucide-react'; // Icons
import { toast } from 'sonner'; // Notifications
import LoadingSpinner from '@/components/LoadingSpinner'; // Loading icon
import FileUploader from '@/components/FileUploader'; // Custom file input
import client from '@/services/apiClient'; // API client

/**
 * MAKE DONATION PAGE
 * 
 * Purpose: This page allows donors to pay for a specific student welfare request.
 * It supports both Online Card payments and manual Bank Transfers.
 */
const MakeDonation = () => {
  // CONFIG: Get IDs and amounts from the URL (sent from Browse page)
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const paramAmount = searchParams.get('amount');
  const paramDesc = searchParams.get('description');
  const paramSchool = searchParams.get('school');

  // STATE: Form and UI management
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(paramAmount ? 'custom' : '');
  const [customAmount, setCustomAmount] = useState(paramAmount || '');
  const [allocation, setAllocation] = useState(requestId ? 'specific' : 'general');
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [receiptFile, setReceiptFile] = useState(null);
  const receiptRef = useRef();

  // ACTION: Creates a printable receipt by opening a new window with formatted HTML
  const handlePrintReceipt = () => {
    const printContent = receiptRef.current.innerHTML;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Donation Receipt - Eduzone</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; }
            .header h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .amount-box { background: #eff6ff; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: 900; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="receipt-card">${printContent}</div>
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  // ACTION: Submits the donation data to the backend
  const handleDonate = async () => {
    const finalAmount = amount === 'custom' ? customAmount : amount;

    // VALIDATION: Basic checks
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

      // DATA PACKAGING: Use FormData for file upload (bank receipt)
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

      await client.post('/donations', formData);

      setSuccess(true);
      toast.success("Thank you! Your donation has been processed.");
    } catch (error) {
      console.error(error);
      toast.error("Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS VIEW: Shown after a successful payment
  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Thank You!</h2>
            <p className="text-xl text-gray-600 mt-2">Your contribution of LKR {amount === 'custom' ? customAmount : amount} has been received.</p>
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => window.location.href = '/donor/browse-requests'}>Browse More Requests</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrintReceipt}>Download Receipt</Button>
          </div>

          {/* HIDDEN TEMPLATE: Used by handlePrintReceipt to generate the PDF/Print page */}
          <div className="hidden">
            <div ref={receiptRef}>
              <div className="header"><h1>OFFICIAL DONATION RECEIPT</h1></div>
              <div className="details">
                <div className="row"><span>Date</span><span>{new Date().toLocaleDateString()}</span></div>
                <div className="row"><span>Donor</span><span>{document.getElementById('anonymous')?.checked ? 'Anonymous' : 'Verified Donor'}</span></div>
                <div className="row"><span>Cause</span><span>{paramSchool || 'General Welfare Fund'}</span></div>
              </div>
              <div className="amount-box">
                <p>Total Amount Contributed</p>
                <p className="amount">LKR {Number(amount === 'custom' ? customAmount : amount).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ERROR VIEW: If someone visits this page without picking a student first
  if (!requestId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <Heart className="w-12 h-12 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">Select a Cause</h2>
          <Button onClick={() => window.location.href = '/donor/browse-requests'} className="bg-blue-600 text-white">
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
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Donation</h1>
          <p className="text-gray-600">You are supporting a verified student request.</p>
        </div>

        {/* INFO CARD: Shows what we are funding */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
          <p className="text-sm text-blue-700 font-medium">Ref ID: {searchParams.get('ref') || `#${requestId}`}</p>
          {paramSchool && <p className="text-xs text-blue-600 mt-1">School: {paramSchool}</p>}
        </div>

        <Card className="border-t-4 border-t-blue-600 shadow-md text-slate-900">
          <CardHeader>
            <CardTitle>Donation Amount (LKR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AMOUNT INPUT */}
            <div className="pt-4">
              <Label className="font-semibold text-lg">Amount to Donate:</Label>
              <div className="mt-3 max-w-sm relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                <Input
                  type="number"
                  className="pl-12 text-lg font-bold"
                  value={amount === 'custom' ? customAmount : amount}
                  onChange={(e) => { setAmount('custom'); setCustomAmount(e.target.value); }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Target Amount for this student: LKR {Number(paramAmount).toLocaleString()}</p>
            </div>

            {/* PAYMENT METHOD SELECTION */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <RadioGroupItem value="Online" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer w-full font-medium">
                    <CreditCard className="w-5 h-5 mr-3 text-slate-500" />
                    Online Card Payment
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer ${paymentMethod === 'Bank Transfer' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <RadioGroupItem value="Bank Transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center cursor-pointer w-full font-medium">
                    <Wallet className="w-5 h-5 mr-3 text-slate-500" />
                    Bank Transfer
                  </Label>
                </div>
              </RadioGroup>

              {/* BANK TRANSFER VIEW: Shows account details and asks for receipt upload */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="bg-slate-100 p-4 rounded-md border border-slate-200 mt-2">
                  <h4 className="font-bold text-sm mb-2 text-slate-800">Bank Account Details</h4>
                  <div className="text-sm text-slate-700 space-y-1 mb-4">
                    <p>Bank: <span className="font-bold">Bank of Ceylon</span></p>
                    <p>Account: <span className="font-bold">Hatton ZEO Welfare</span></p>
                    <p>No: <span className="font-bold">1234-5678-9012</span></p>
                  </div>
                  <FileUploader
                    id="receipt"
                    label="Upload Transfer Receipt (Proof)"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    file={receiptFile}
                  />
                </div>
              )}
            </div>

            {/* PRIVACY CHECKBOX */}
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox id="anonymous" />
              <Label htmlFor="anonymous" className="font-medium cursor-pointer text-slate-700">
                Make this donation anonymous (Hide my name in public logs)
              </Label>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 flex justify-end p-6 rounded-b-lg">
            <Button
              size="lg"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] font-bold"
              onClick={handleDonate}
              disabled={loading}
            >
              {loading ? "Processing..." : "Donate Now"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MakeDonation;
