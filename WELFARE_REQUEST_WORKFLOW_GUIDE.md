# 💰 Welfare Request Workflow: Complete Step-by-Step

## What is a Welfare Request?

A **Welfare Request** = A student needs financial help (for books, uniforms, school fees, etc.)

Teachers submit these on behalf of students, then principals and ZEO review them, then donors can fund them.

---

## The Complete Workflow (State Machine)

```
SUBMITTED (Teacher creates)
    ↓
PRINCIPAL_APPROVED (Principal reviews and approves)
    ↓
ZEO_APPROVED (ZEO does final review)
    ↓
PUBLISHED (Visible to donors)
    ↓
PARTIALLY_FUNDED (Some donations received)
    ↓
FULLY_FUNDED (Total donations = requested amount)
    ↓
TRANSFERRED (Money sent to school)
```

Each step can also be REJECTED, ending the request.

---

## Step 1: Teacher Submits Welfare Request

### What Teacher Sees

**URL**: `http://localhost:3000/teacher/submit-request`

**Page**: `frontend/src/pages/teacher/SubmitWelfareRequest.jsx`

**Form**:
```
Student Name:    [Ahmed Hassan      ]
Grade:           [10 ▼] Section: [A ▼]
Welfare Type:    [Books ▼]
Description:     [Needs textbooks for this semester]
Estimated Cost:  [5000             ]
Documents:       [Upload file button]
[Submit Request Button]
```

### Frontend: User Fills & Submits

**File**: `frontend/src/pages/teacher/SubmitWelfareRequest.jsx`

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // Prepare data from form
        const payload = {
            studentName: formData.studentName,      // "Ahmed Hassan"
            grade: `${formData.grade}-${formData.section}`,  // "10-A"
            welfareType: formData.welfareType,      // "Books"
            description: formData.description,      // "Needs textbooks..."
            estimatedCost: formData.estimatedCost,  // 5000
            supportingDocument: formData.supportingDocument  // File object (optional)
        };

        // Create FormData object if there's a file
        let requestData = payload;
        if (payload.supportingDocument) {
            const formDataWithFile = new FormData();
            Object.keys(payload).forEach(key => {
                formDataWithFile.append(key, payload[key]);
            });
            requestData = formDataWithFile;
        }

        // Send to backend
        const response = await client.post('/welfare', requestData);

        if (response.data.success) {
            toast.success('Request submitted successfully!');
            // Redirect to view all their requests
            navigate('/teacher/track-requests');
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
        setLoading(false);
    }
};
```

### Backend: Receive & Process

**File**: `backend/routes/welfareRoutes.js`

```javascript
// Route that receives the request
router.post('/', 
    protect,                                    // Only logged-in users
    validationRules.createWelfareRequest(),    // Validate data
    validate,
    asyncHandler(createWelfareRequest)         // Call handler
);
```

**File**: `backend/controllers/welfareController.js` → `createWelfareRequest()`

```javascript
const createWelfareRequest = async (req, res) => {
    const { studentName, grade, welfareType, description, estimatedCost } = req.body;
    const teacherId = req.user.id;  // Get teacher ID from JWT token

    try {
        // ============ VALIDATE INPUT ============
        if (!studentName || !estimatedCost || !welfareType) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields required' 
            });
        }

        // Cost must be positive number
        if (estimatedCost <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cost must be greater than 0' 
            });
        }

        // ============ GET TEACHER INFO ============
        // Need to find which school this teacher belongs to
        const teacher = await Teacher.findOne({ 
            where: { userId: teacherId },
            include: [{ model: School, as: 'school' }]
        });

        if (!teacher) {
            return res.status(403).json({ 
                success: false, 
                message: 'Teacher not found' 
            });
        }

        // ============ FIND OR CREATE STUDENT ============
        // Check if student already in system
        const [student, created] = await Student.findOrCreate({
            where: {
                name: studentName,
                schoolId: teacher.schoolId  // Same school as teacher
            },
            defaults: {
                grade: grade,
                schoolId: teacher.schoolId
            }
        });

        // ============ CREATE WELFARE REQUEST ============
        const welfareRequest = await WelfareRequest.create({
            studentId: student.id,           // Link to student
            studentName: studentName,        // Also store name directly
            grade: grade,                    // "10-A"
            welfareType: welfareType,        // "Books"
            description: description,        // Reason for help
            estimatedCost: estimatedCost,    // Amount needed: 5000
            teacherId: teacherId,            // Which teacher submitted
            schoolId: teacher.schoolId,      // Which school
            status: 'SUBMITTED',             // Initial status
            createdAt: new Date(),
            fundedAmount: 0                  // No donations yet
        });

        // ============ HANDLE FILE UPLOAD ============
        // If teacher uploaded supporting document (receipt, etc)
        if (req.file) {
            // Save file to server and record in database
            // (File upload logic handled by middleware)
        }

        // ============ CREATE AUDIT LOG ============
        // Record that teacher created this request (for tracking)
        await AuditLog.create({
            action: 'WELFARE_REQUEST_CREATED',
            userId: teacherId,
            resourceId: welfareRequest.id,
            details: { studentName, estimatedCost }
        });

        // ============ SEND RESPONSE ============
        res.status(201).json({
            success: true,
            message: 'Welfare request created successfully',
            requestId: welfareRequest.id,
            status: 'SUBMITTED',
            referenceId: `WR-${welfareRequest.id}`,  // For display
            nextSteps: 'Your principal will review this request'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Database Changes

**WelfareRequest table gets new row**:
```
{
  id: 1,
  studentId: 5,
  studentName: "Ahmed Hassan",
  grade: "10-A",
  welfareType: "Books",
  description: "Needs textbooks for this semester",
  estimatedCost: 5000,
  teacherId: 3,      // User #3 is a teacher
  schoolId: 2,       // School #2
  status: "SUBMITTED",
  fundedAmount: 0,
  createdAt: "2024-04-16 10:30:00",
  approvalDate: null,
  publishDate: null
}
```

**Frontend Response**:
```javascript
{
  "success": true,
  "message": "Welfare request created successfully",
  "requestId": 1,
  "status": "SUBMITTED",
  "referenceId": "WR-1"
}
```

---

## Step 2: Principal Reviews Request

### What Principal Sees

**URL**: `http://localhost:3000/principal/review-requests`

**Page**: Principal dashboard

**Shows**:
```
Pending Requests for Lincoln High School

1. Ahmed Hassan - Grade 10-A
   Type: Books
   Amount: 5000 BDT
   Reason: Needs textbooks for this semester
   [View] [Approve] [Reject]

2. Fatima Khan - Grade 9-B
   Type: Uniforms
   Amount: 3000 BDT
   Reason: Needs school uniform
   [View] [Approve] [Reject]
```

### Frontend: Principal Clicks "Approve"

```javascript
const handleApprove = async (requestId) => {
    try {
        // Send approval to backend
        const response = await client.put(
            `/welfare/${requestId}/status`,
            {
                status: 'PRINCIPAL_APPROVED',
                approvalNotes: 'Approved - student needs verified',  // Optional
                approvalDate: new Date()
            }
        );

        if (response.data.success) {
            toast.success('Request approved!');
            // Reload list
            fetchRequests();
        }
    } catch (error) {
        toast.error('Failed to approve');
    }
};
```

### Backend: Update Status

**File**: `backend/controllers/welfareController.js` → `updateWelfareStatus()`

```javascript
const updateWelfareStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, approvalNotes } = req.body;
    const userId = req.user.id;

    try {
        // ============ FIND REQUEST ============
        const welfareRequest = await WelfareRequest.findByPk(requestId);

        if (!welfareRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found' 
            });
        }

        // ============ PERMISSION CHECK ============
        if (req.user.role === 'PRINCIPAL') {
            // Principal can only approve their school's requests
            const principal = await Principal.findOne({ 
                where: { userId: userId } 
            });
            
            if (welfareRequest.schoolId !== principal.schoolId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Cannot approve requests from other schools' 
                });
            }

            // Principal can only move SUBMITTED → PRINCIPAL_APPROVED
            if (welfareRequest.status !== 'SUBMITTED') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only approve submitted requests' 
                });
            }
        }

        if (req.user.role === 'ZEO') {
            // ZEO can approve PRINCIPAL_APPROVED → ZEO_APPROVED
            // And publish → PUBLISHED
        }

        // ============ UPDATE STATUS ============
        welfareRequest.status = status;  // "SUBMITTED" → "PRINCIPAL_APPROVED"
        welfareRequest.approvedBy = userId;
        welfareRequest.approvalDate = new Date();
        welfareRequest.approvalNotes = approvalNotes;
        
        await welfareRequest.save();

        // ============ CREATE AUDIT LOG ============
        await AuditLog.create({
            action: 'WELFARE_REQUEST_APPROVED',
            userId: userId,
            resourceId: requestId,
            details: { previousStatus: 'SUBMITTED', newStatus: status }
        });

        // ============ SEND NOTIFICATION ============
        // Notify teacher that request was approved
        await sendEmail({
            email: teacher.email,
            subject: 'Your Welfare Request Was Approved',
            message: `Your welfare request for ${welfareRequest.studentName} has been approved by the principal.`
        });

        // ============ SEND RESPONSE ============
        res.status(200).json({
            success: true,
            message: 'Request status updated',
            newStatus: status
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Database Changes

**WelfareRequest table updated**:
```
{
  ...
  status: "PRINCIPAL_APPROVED",  // Changed from SUBMITTED
  approvedBy: 2,                  // User #2 (principal)
  approvalDate: "2024-04-16 11:00:00",
  approvalNotes: "Approved - student needs verified"
}
```

---

## Step 3: ZEO Final Approval & Publish

### What ZEO Sees

ZEO dashboard shows all PRINCIPAL_APPROVED requests pending final review.

### Frontend: ZEO Clicks "Approve & Publish"

```javascript
const handlePublish = async (requestId) => {
    try {
        const response = await client.put(
            `/welfare/${requestId}/status`,
            {
                status: 'PUBLISHED',
                notes: 'Final approval - ready for donors'
            }
        );

        if (response.data.success) {
            toast.success('Request published! Donors can now see it.');
            fetchRequests();
        }
    } catch (error) {
        toast.error('Failed to publish');
    }
};
```

### Backend: ZEO Publishes Request

```javascript
const updateWelfareStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    try {
        const welfareRequest = await WelfareRequest.findByPk(requestId);

        // ============ ZEO SPECIFIC LOGIC ============
        if (req.user.role === 'ZEO') {
            // Can only move PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED
            if (welfareRequest.status !== 'PRINCIPAL_APPROVED') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only approve principal-approved requests' 
                });
            }
        }

        // ============ UPDATE STATUS ============
        welfareRequest.status = 'PUBLISHED';
        welfareRequest.publishDate = new Date();
        welfareRequest.publishedBy = userId;
        await welfareRequest.save();

        // ============ SEND NOTIFICATION TO TEACHER & PRINCIPAL ============
        // They'll know request is now live for donations
        const teacher = await User.findByPk(welfareRequest.teacherId);
        const principal = await Principal.findOne({ ... });

        await sendEmail({
            email: teacher.email,
            subject: 'Your Welfare Request Is Now Live!',
            message: `Request for ${welfareRequest.studentName} is now published. Donors can start contributing!`
        });

        // ============ RESPONSE ============
        res.status(200).json({
            success: true,
            message: 'Request published successfully',
            isNowVisible: 'Donors can now see this request'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Database Changes

```
{
  ...
  status: "PUBLISHED",           // Now visible to donors!
  publishDate: "2024-04-16 14:00:00",
  publishedBy: 1                 // User #1 is ZEO
}
```

---

## Step 4: Donors See & Fund the Request

### What Donors See

**URL**: `http://localhost:3000/donor/browse-requests`

**Page**: `frontend/src/pages/donor/BrowseWelfareRequests.jsx`

**Shows all PUBLISHED requests**:
```
Available Requests to Fund

Ahmed Hassan - Grade 10-A, Lincoln High School
Type: Books
Amount Needed: 5000 BDT
Progress: ████░░░░░░ 40% funded (2000 of 5000)
[Donate] [View Details]

Fatima Khan - Grade 9-B, Lincoln High School
Type: Uniforms
Amount Needed: 3000 BDT
Progress: ██░░░░░░░░ 20% funded (600 of 3000)
[Donate] [View Details]
```

### Donor Clicks "Donate"

**URL**: `http://localhost:3000/donor/make-donation?requestId=1&amount=5000`

**Page**: `frontend/src/pages/donor/MakeDonation.jsx`

**Form**:
```
STEP 1: Select Amount
[ ] $10    [ ] $50    [x] $100    [ ] $500    [ ] Custom: [____]

STEP 2: Payment Method
( ) Online
(x) Bank Transfer

STEP 3: Upload Receipt
[Upload file]

[Proceed] [Cancel]
```

### Frontend: Donor Submits Donation

```javascript
const handleDonate = async () => {
    // ============ VALIDATE INPUT ============
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
        // ============ PREPARE DATA ============
        const donationData = {
            requestId: requestId,        // Which request to fund
            amount: finalAmount,         // How much donating
            paymentMethod: paymentMethod, // "Online" or "Bank Transfer"
            donorNotes: notes            // Optional message
        };

        // ============ SUBMIT DONATION ============
        const response = await client.post('/donations', donationData);

        if (response.data.success) {
            toast.success('Thank you for your donation!');
            
            // Record donation in local state (for receipt)
            setSuccess(true);
            
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/donor/dashboard');
            }, 3000);
        }
    } catch (error) {
        toast.error(error.response?.data?.message);
    } finally {
        setLoading(false);
    }
};
```

### Backend: Record Donation

**File**: `backend/controllers/donationController.js` → `submitDonation()`

```javascript
const submitDonation = async (req, res) => {
    const { requestId, amount, paymentMethod, donorNotes } = req.body;
    const donorId = req.user.id;  // Get donor from JWT

    try {
        // ============ FIND DONOR PROFILE ============
        const donor = await Donor.findOne({ 
            where: { userId: donorId } 
        });

        if (!donor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Donor profile not found' 
            });
        }

        // ============ FIND WELFARE REQUEST ============
        const welfareRequest = await WelfareRequest.findByPk(requestId);

        if (!welfareRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found' 
            });
        }

        // ============ CHECK REQUEST STATUS ============
        if (welfareRequest.status !== 'PUBLISHED') {
            return res.status(400).json({ 
                success: false, 
                message: 'This request is not currently accepting donations' 
            });
        }

        // ============ VALIDATE AMOUNT ============
        if (amount <= 0 || amount > 1000000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid donation amount' 
            });
        }

        // ============ CREATE DONATION RECORD ============
        const donation = await Donation.create({
            donorId: donor.id,          // Who donated
            requestId: requestId,       // Which request
            amount: amount,             // How much
            paymentMethod: paymentMethod,  // "Online" or "Bank Transfer"
            status: 'COMPLETED',        // Assuming successful
            donorNotes: donorNotes,
            createdAt: new Date()
        });

        // ============ UPDATE REQUEST FUNDED AMOUNT ============
        // Add this donation to total funded amount
        welfareRequest.fundedAmount = 
            (welfareRequest.fundedAmount || 0) + amount;

        // ============ CHECK IF NOW FULLY FUNDED ============
        if (welfareRequest.fundedAmount >= welfareRequest.estimatedCost) {
            // Fully funded!
            welfareRequest.status = 'FULLY_FUNDED';
            welfareRequest.fullyFundedDate = new Date();

            // Notify principal: time to transfer!
            const principal = await Principal.findOne({ 
                where: { schoolId: welfareRequest.schoolId } 
            });

            if (principal) {
                const principalUser = await User.findByPk(principal.userId);
                await sendEmail({
                    email: principalUser.email,
                    subject: 'Welfare Request Fully Funded',
                    message: `Request for ${welfareRequest.studentName} is now fully funded at ${welfareRequest.fundedAmount} BDT!`
                });
            }
        } else {
            // Partially funded
            if (welfareRequest.status !== 'PARTIALLY_FUNDED') {
                welfareRequest.status = 'PARTIALLY_FUNDED';
            }
        }

        // Save updated request
        await welfareRequest.save();

        // ============ SEND THANK YOU EMAIL TO DONOR ============
        const user = await User.findByPk(donorId);
        await sendEmail({
            email: user.email,
            subject: 'Thank You for Your Donation!',
            message: `Thank you for donating ${amount} BDT to help ${welfareRequest.studentName}. 
                     You've made a real difference!`
        });

        // ============ RESPONSE ============
        res.status(201).json({
            success: true,
            message: 'Donation recorded successfully',
            donationId: donation.id,
            totalFunded: welfareRequest.fundedAmount,
            isFullyFunded: welfareRequest.status === 'FULLY_FUNDED',
            amountStillNeeded: Math.max(0, welfareRequest.estimatedCost - welfareRequest.fundedAmount)
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Database Changes

**Donation table gets new row**:
```
{
  id: 1,
  donorId: 4,           // User #4 (donor)
  requestId: 1,         // Welfare request #1
  amount: 100,
  paymentMethod: "Bank Transfer",
  status: "COMPLETED",
  createdAt: "2024-04-16 15:30:00"
}
```

**WelfareRequest updated**:
```
{
  ...
  fundedAmount: 2100,   // Updated from 2000 to 2100
  status: "PARTIALLY_FUNDED"  // Still waiting for more
}
```

---

## Step 5: Request Gets Fully Funded

### When 5000+ is Donated

After multiple donors donate, total reaches 5000 BDT.

Backend automatically:
1. Updates `fundedAmount` to 5000+
2. Changes `status` to "FULLY_FUNDED"
3. Sends email to principal: "Request is now fully funded!"

**WelfareRequest table**:
```
{
  ...
  fundedAmount: 5500,   // Total donations exceed goal
  status: "FULLY_FUNDED"
}
```

---

## Step 6: Principal Transfers to School

### What Principal Sees

Principal receives email and/or sees dashboard notification:
```
Request Fully Funded!
Ahmed Hassan - Books - 5000 BDT

Ready to transfer to school account?
[Initiate Transfer] [View Details]
```

### Frontend: Principal Clicks "Transfer"

```javascript
const handleTransfer = async (requestId) => {
    try {
        const response = await client.post(
            `/transfers`,
            {
                requestId: requestId,
                transferNotes: 'Funding for books request'
            }
        );

        if (response.data.success) {
            toast.success('Transfer initiated! Money will be sent to school account.');
        }
    } catch (error) {
        toast.error('Failed to initiate transfer');
    }
};
```

### Backend: Create Transfer Record

**File**: `backend/controllers/transferController.js`

```javascript
const initiateTransfer = async (req, res) => {
    const { requestId } = req.body;
    const principalId = req.user.id;

    try {
        // ============ FIND REQUEST ============
        const welfareRequest = await WelfareRequest.findByPk(requestId);

        if (!welfareRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found' 
            });
        }

        // ============ CHECK STATUS ============
        if (welfareRequest.status !== 'FULLY_FUNDED') {
            return res.status(400).json({ 
                success: false, 
                message: 'Request must be fully funded before transfer' 
            });
        }

        // ============ GET SCHOOL INFO ============
        const school = await School.findByPk(welfareRequest.schoolId);

        if (!school || !school.bankAccountNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'School bank details not configured' 
            });
        }

        // ============ CREATE TRANSFER RECORD ============
        const transfer = await Transfer.create({
            requestId: requestId,
            schoolId: welfareRequest.schoolId,
            amount: welfareRequest.fundedAmount,
            initiatedBy: principalId,
            status: 'INITIATED',  // Will move to VERIFIED then TRANSFERRED
            bankAccountNumber: school.bankAccountNumber,
            createdAt: new Date()
        });

        // ============ PROCESS BANK TRANSFER ============
        // (In real app, this would call actual bank API)
        // For now, simulate transfer
        try {
            // Call bank API to transfer money
            const transferResult = await processPaymentGateway({
                fromAccount: 'EDUZONE_MAIN',
                toAccount: school.bankAccountNumber,
                amount: welfareRequest.fundedAmount,
                reference: `TR-${transfer.id}`
            });

            if (transferResult.success) {
                transfer.status = 'TRANSFERRED';
                transfer.bankTransactionId = transferResult.transactionId;
                transfer.transferDate = new Date();

                // ============ UPDATE REQUEST STATUS ============
                welfareRequest.status = 'TRANSFERRED';
                welfareRequest.transferDate = new Date();

                // ============ CREATE AUDIT LOG ============
                await AuditLog.create({
                    action: 'FUNDS_TRANSFERRED',
                    userId: principalId,
                    details: {
                        amount: welfareRequest.fundedAmount,
                        requestId: requestId,
                        schoolId: welfareRequest.schoolId
                    }
                });
            }
        } catch (bankError) {
            transfer.status = 'FAILED';
            transfer.errorMessage = bankError.message;
        }

        await transfer.save();
        await welfareRequest.save();

        // ============ SEND NOTIFICATIONS ============
        // Notify teacher
        const teacher = await User.findByPk(welfareRequest.teacherId);
        await sendEmail({
            email: teacher.email,
            subject: 'Funds Transferred!',
            message: `Funds for ${welfareRequest.studentName} have been transferred to school account.`
        });

        // Notify all donors
        const donations = await Donation.findAll({ where: { requestId } });
        for (const donation of donations) {
            const donor = await Donor.findByPk(donation.donorId);
            const donorUser = await User.findByPk(donor.userId);
            
            await sendEmail({
                email: donorUser.email,
                subject: 'Your Donation Was Transferred!',
                message: `Your donation of ${donation.amount} BDT has been transferred to school account to help ${welfareRequest.studentName}.`
            });
        }

        // ============ RESPONSE ============
        res.status(201).json({
            success: true,
            message: 'Transfer initiated successfully',
            transferId: transfer.id,
            status: transfer.status,
            amount: transfer.amount
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Database Changes

**Transfer table gets new row**:
```
{
  id: 1,
  requestId: 1,
  schoolId: 2,
  amount: 5500,
  initiatedBy: 2,       // Principal #2
  status: "TRANSFERRED",
  bankAccountNumber: "1234567890",
  bankTransactionId: "TXN-2024-001",
  transferDate: "2024-04-16 16:00:00"
}
```

**WelfareRequest updated**:
```
{
  ...
  status: "TRANSFERRED",
  transferDate: "2024-04-16 16:00:00"
}
```

---

## Complete Data Flow Summary

```
1. Teacher submits request
   ↓
   Creates: WelfareRequest (status: SUBMITTED)
   
2. Principal approves
   ↓
   Updates: WelfareRequest (status: PRINCIPAL_APPROVED)
   
3. ZEO publishes
   ↓
   Updates: WelfareRequest (status: PUBLISHED)
   
4. Donors donate (multiple)
   ↓
   Creates: Donation rows
   Updates: WelfareRequest (fundedAmount += donation amount)
   
5. When fully funded
   ↓
   Updates: WelfareRequest (status: FULLY_FUNDED)
   
6. Principal transfers
   ↓
   Creates: Transfer record (status: TRANSFERRED)
   Updates: WelfareRequest (status: TRANSFERRED)
```

---

## Files Involved in This Workflow

### Frontend
- `pages/teacher/SubmitWelfareRequest.jsx` - Submit form
- `pages/principal/ReviewRequests.jsx` - Principal approval
- `pages/zeo/PublishRequests.jsx` - ZEO publishing
- `pages/donor/BrowseWelfareRequests.jsx` - Browse list
- `pages/donor/MakeDonation.jsx` - Donation form
- `pages/principal/ReceivedFunds.jsx` - Transfer management

### Backend
- `routes/welfareRoutes.js` - API routes for requests
- `routes/donationRoutes.js` - API routes for donations
- `routes/transferRoutes.js` - API routes for transfers
- `controllers/welfareController.js` - Request logic
- `controllers/donationController.js` - Donation logic
- `controllers/transferController.js` - Transfer logic
- `models/WelfareRequest.js` - Request schema
- `models/Donation.js` - Donation schema
- `models/Transfer.js` - Transfer schema

---

## Key Concepts

### Status Machine
Each welfare request has a status that can only move forward:
```
SUBMITTED → PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED 
           → PARTIALLY_FUNDED → FULLY_FUNDED → TRANSFERRED
```

Can be REJECTED at any stage.

### Funding Amount Tracking
- `estimatedCost` = amount requested (5000)
- `fundedAmount` = total donations received (increments with each donation)
- Status changes based on funding progress:
  - 0% funded = PUBLISHED
  - 1-99% funded = PARTIALLY_FUNDED
  - 100%+ funded = FULLY_FUNDED

### Audit Trail
Every action is logged:
- Who submitted? (teacher)
- When approved? (date + principal)
- When published? (date + ZEO)
- Which donors funded? (donation records)
- When transferred? (date + transfer record)

This creates complete transparency for all parties.

---

Great! You now understand the complete welfare request workflow! 🎉
