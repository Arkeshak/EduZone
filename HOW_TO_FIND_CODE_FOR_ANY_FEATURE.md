# 🗂️ How to Find Code for Any Feature: Complete Navigation Guide

## The Golden Rule

**Every piece of code has this structure**:

```
Frontend Page (what user sees)
    ↓ (calls)
Frontend Service (talks to backend)
    ↓ (HTTP request)
Backend Route (receives request)
    ↓ (calls)
Backend Controller (does the work)
    ↓ (reads/writes)
Database Model (stores data)
    ↓ (stores)
Database Table (actual data)
```

**To find code for any feature, follow this chain!**

---

## Method 1: Start from Frontend Page

### Scenario: "I want to modify the Donation form"

**Step 1: Find the page file**
- Location: `frontend/src/pages/donor/MakeDonation.jsx`
- Open it and read the code

**What to look for in the file**:
```javascript
// Form inputs
<Input value={amount} onChange={(e) => setAmount(e.target.value)} />

// Submit button
<Button onClick={handleDonate}>Submit</Button>

// API call
const response = await client.post('/donations', data);
```

**Step 2: Find the service/API call**
- Search for: `client.post('/donations')`
- OR look in: `frontend/src/services/donationService.js` (if exists)
- OR look in: `frontend/src/services/apiClient.js`

**Step 3: Find the backend route**
- Look in: `backend/routes/donationRoutes.js`
- Search for: `router.post('/'` or `router.post('/donations'`
- You'll see: `router.post('/', asyncHandler(submitDonation));`

**Step 4: Find the controller function**
- Look in: `backend/controllers/donationController.js`
- Find: `const submitDonation = async (req, res) => { ... }`

**Step 5: Find the database model**
- Look in: `backend/models/Donation.js`
- See what fields a donation has

**Step 6: Find the database table**
- Look in database explorer or see field definitions in model
- Example fields: `id`, `donorId`, `requestId`, `amount`, `status`

---

## Method 2: Start from Feature Name

### Scenario: "I want to understand how login works"

**Step 1: Identify the feature**
- Feature: Login/Authentication
- This is used by: Everyone
- Found in: Auth system

**Step 2: Find frontend code**
- Search for: `login`, `Login`
- Files:
  - `frontend/src/pages/Login.jsx` (the page)
  - `frontend/src/services/authService.js` (API calls)
  - `frontend/src/context/AuthContext.jsx` (global state)

**Step 3: Find backend code**
- Search for: `auth`, `login`, `Login`
- Files:
  - `backend/routes/authRoutes.js` (endpoints)
  - `backend/controllers/authController.js` (logic)
  - `backend/middleware/authMiddleware.js` (checks login)

**Step 4: Find data models**
- `backend/models/User.js` (stores user data)
- `backend/models/PasswordReset.js` (stores reset tokens)

---

## Method 3: Use VS Code Search (Ctrl+F)

### Finding a Function or Variable

**Example: "Where is the loginUser function used?"**

1. Press `Ctrl+Shift+F` (find in all files)
2. Search: `loginUser`
3. VS Code shows all occurrences:
   - `authController.js` line 250 (definition)
   - `authRoutes.js` line 15 (used in route)
   - Other files (imports)

**Click on each occurrence** to understand how function is used.

### Finding a File

**Example: "Find WelfareRequest model"**

1. Press `Ctrl+P` (quick file open)
2. Type: `WelfareRequest`
3. VS Code suggests: `backend/models/WelfareRequest.js`
4. Click to open

---

## Quick Reference: Files by Feature

### Authentication Feature
```
Frontend Files:
- pages/Login.jsx                    (login page)
- pages/DonorRegistration.jsx        (signup page)
- pages/ForgotPassword.jsx           (password recovery)
- pages/ResetPassword.jsx            (reset form)
- pages/ActivateAccount.jsx          (email verification)
- services/authService.js            (auth API calls)
- context/AuthContext.jsx            (global auth state)

Backend Files:
- routes/authRoutes.js               (auth endpoints)
- controllers/authController.js      (auth logic)
- models/User.js                     (user data)
- models/PasswordReset.js            (password reset)
- middleware/authMiddleware.js       (protects routes)
```

### Welfare Request Feature
```
Frontend Files:
- pages/teacher/SubmitWelfareRequest.jsx     (create request)
- pages/teacher/TrackRequests.jsx            (view requests)
- pages/principal/ReviewRequests.jsx         (approve)
- pages/zeo/PublishRequests.jsx              (publish)
- pages/donor/BrowseWelfareRequests.jsx      (browse)

Backend Files:
- routes/welfareRoutes.js             (request endpoints)
- controllers/welfareController.js    (request logic)
- models/WelfareRequest.js            (request data)
- models/Student.js                   (student data)
- models/Teacher.js                   (teacher link)
```

### Donation Feature
```
Frontend Files:
- pages/donor/MakeDonation.jsx              (donation form)
- pages/donor/DonorDashboard.jsx            (view donations)

Backend Files:
- routes/donationRoutes.js             (donation endpoints)
- controllers/donationController.js    (donation logic)
- models/Donation.js                   (donation data)
```

### Transfer Feature
```
Frontend Files:
- pages/principal/ReceivedFunds.jsx         (manage transfers)

Backend Files:
- routes/transferRoutes.js              (transfer endpoints)
- controllers/transferController.js     (transfer logic)
- models/Transfer.js                    (transfer data)
```

### Dashboard Feature (Role-Based)
```
Frontend Files:
- pages/teacher/TeacherDashboard.jsx        (teacher home)
- pages/principal/PrincipalDashboard.jsx    (principal home)
- pages/donor/DonorDashboard.jsx            (donor home)
- pages/zeo/ZEODashboard.jsx                (admin home)
- layouts/DashboardLayout.jsx               (shared layout)
```

---

## Understanding the Flow: Complete Example

### "Understand what happens when a teacher submits a welfare request"

#### STEP 1: Frontend (What User Sees)

**File**: `frontend/src/pages/teacher/SubmitWelfareRequest.jsx`

```javascript
// Component starts here
const SubmitWelfareRequest = () => {
    // State for form
    const [formData, setFormData] = useState({
        studentName: '',
        grade: '',
        welfareType: '',
        estimatedCost: '',
        description: ''
    });

    // When user clicks Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data
        const payload = {
            studentName: formData.studentName,
            grade: `${formData.grade}-${formData.section}`,
            welfareType: formData.welfareType,
            description: formData.description,
            estimatedCost: formData.estimatedCost
        };

        // Send to backend
        const response = await client.post('/welfare', payload);
        
        // Show result
        if (response.data.success) {
            toast.success('Request submitted!');
            navigate('/teacher/track-requests');
        }
    };

    // Render form UI
    return (
        <DashboardLayout>
            <form onSubmit={handleSubmit}>
                <Input 
                    label="Student Name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({
                        ...formData,
                        studentName: e.target.value
                    })}
                />
                {/* More form fields */}
                <Button type="submit">Submit Request</Button>
            </form>
        </DashboardLayout>
    );
};
```

**What happens on screen**:
1. Form appears with fields
2. User fills: "Ahmed", "10-A", "Books", "5000", "Needs textbooks"
3. User clicks "Submit Request"
4. Loading spinner appears
5. Request sent to backend

#### STEP 2: Network Request

Data sent over the internet:
```
POST http://localhost:5000/api/welfare
Content-Type: application/json

{
    "studentName": "Ahmed",
    "grade": "10-A",
    "welfareType": "Books",
    "description": "Needs textbooks",
    "estimatedCost": "5000"
}
```

#### STEP 3: Backend Routes

**File**: `backend/routes/welfareRoutes.js`

```javascript
// This route handles the POST request
router.post('/', 
    protect,                                    // Check: logged in?
    validationRules.createWelfareRequest(),    // Check: valid data?
    validate,                                   // Run validation
    asyncHandler(createWelfareRequest)         // Call this function
);
```

**In order**:
1. `protect` middleware checks: JWT token valid? User logged in?
2. `validationRules` sets what validation to do
3. `validate` middleware runs the validation
4. If all pass, call `createWelfareRequest()` function

#### STEP 4: Backend Controller

**File**: `backend/controllers/welfareController.js`

```javascript
const createWelfareRequest = async (req, res) => {
    // Get data from request
    const { studentName, grade, welfareType, description, estimatedCost } = req.body;
    const teacherId = req.user.id;  // From JWT token

    try {
        // Find which school this teacher belongs to
        const teacher = await Teacher.findOne({ 
            where: { userId: teacherId }
        });

        // Find or create student record
        const [student] = await Student.findOrCreate({
            where: { name: studentName, schoolId: teacher.schoolId },
            defaults: { grade, schoolId: teacher.schoolId }
        });

        // Create welfare request
        const request = await WelfareRequest.create({
            studentId: student.id,
            studentName: studentName,
            grade: grade,
            welfareType: welfareType,
            description: description,
            estimatedCost: estimatedCost,
            teacherId: teacherId,
            schoolId: teacher.schoolId,
            status: 'SUBMITTED',
            fundedAmount: 0
        });

        // Send back success
        res.status(201).json({
            success: true,
            message: 'Request created',
            requestId: request.id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

#### STEP 5: Database Models

**File**: `backend/models/WelfareRequest.js`

Defines what fields a welfare request has:
```javascript
const WelfareRequest = db.define('WelfareRequest', {
    id: { type: INTEGER, primaryKey: true },
    studentId: { type: INTEGER },
    studentName: { type: STRING },
    grade: { type: STRING },
    welfareType: { type: STRING },
    description: { type: TEXT },
    estimatedCost: { type: DECIMAL },
    teacherId: { type: INTEGER },
    schoolId: { type: INTEGER },
    status: { type: ENUM('SUBMITTED', 'PRINCIPAL_APPROVED', ...) },
    fundedAmount: { type: DECIMAL },
    createdAt: { type: DATE }
});
```

#### STEP 6: Data Stored in Database

In the `welfare_requests` table, a new row is created:
```
id | studentId | studentName | grade | welfareType | estimatedCost | teacherId | schoolId | status      | fundedAmount | createdAt
1  | 5         | Ahmed       | 10-A  | Books       | 5000          | 3         | 2        | SUBMITTED   | 0            | 2024-04-16...
```

#### STEP 7: Response Sent Back to Frontend

Backend sends:
```json
{
    "success": true,
    "message": "Request created",
    "requestId": 1
}
```

#### STEP 8: Frontend Handles Response

```javascript
// In handleSubmit function
const response = await client.post('/welfare', payload);

// Check if success
if (response.data.success) {
    // Show success message
    toast.success('Request submitted!');
    
    // Redirect to track requests page
    navigate('/teacher/track-requests');
}
```

#### STEP 9: User Sees Result

1. Loading spinner disappears
2. Green success message: "Request submitted!"
3. Page redirects to `/teacher/track-requests`
4. New request appears in the list

---

## Finding Code by Error Message

### Scenario: You see error "Request is not currently accepting donations"

**Step 1: Search for error message**
- Press `Ctrl+Shift+F`
- Search: `not currently accepting donations`

**Step 2: Find where it's thrown**
- Results show: `donationController.js` line 45

**Step 3: Read surrounding code**
- See the condition that triggers the error
- Find what you need to fix

---

## Code Structure Patterns

### Pattern 1: Route Definition

```javascript
// backend/routes/welfareRoutes.js
router.post('/',              // POST /api/welfare
    protect,                  // Middleware 1: Check login
    validate,                 // Middleware 2: Validate data
    asyncHandler(createWelfareRequest)  // Middleware 3: Call function
);
```

**Read left to right**: "When POST /welfare, first check login, then validate, then create"

### Pattern 2: Controller Function

```javascript
// backend/controllers/welfareController.js
const createWelfareRequest = async (req, res) => {
    // 1. Get input
    const { ...data } = req.body;
    
    // 2. Validate
    if (!data.studentName) return res.status(400).json(...);
    
    // 3. Query database
    const student = await Student.findOne(...);
    
    // 4. Create/update
    const request = await WelfareRequest.create(...);
    
    // 5. Send response
    res.status(201).json({ success: true, ... });
};
```

**Structure**: Get → Validate → Query → Modify → Respond

### Pattern 3: Frontend API Call

```javascript
// frontend/src/pages/SomePage.jsx
const handleSubmit = async () => {
    // 1. Prepare data
    const data = { ...formData };
    
    // 2. Call backend
    const response = await client.post('/endpoint', data);
    
    // 3. Handle response
    if (response.data.success) {
        // Success
        toast.success('Done!');
        navigate('/next-page');
    } else {
        // Error
        toast.error(response.data.message);
    }
};
```

**Structure**: Prepare → Call → Check → Handle

---

## Debugging Tips

### Tip 1: Use Console Logs

Add `console.log()` to understand what's happening:

```javascript
// Frontend
console.log('Form data:', formData);
console.log('Response:', response.data);

// Backend
console.log('Received request:', req.body);
console.log('User ID from token:', req.user.id);
console.log('Student found:', student);
```

View logs in:
- Frontend: DevTools (F12) → Console
- Backend: Terminal where server is running

### Tip 2: Check Network Requests

See exactly what's being sent/received:

1. Open DevTools (F12)
2. Go to Network tab
3. Try the feature
4. Click on the request
5. See:
   - Request body (what frontend sent)
   - Response body (what backend sent)
   - Status code (200 = success, 400 = error, 500 = server error)

### Tip 3: Read Error Messages

Error messages tell you exactly what's wrong:

- "Request is not currently accepting donations" → Request status isn't PUBLISHED
- "User not found" → Teacher profile missing from database
- "Invalid or expired token" → Need to re-login
- "School already has a principal" → Can't assign second principal

**Fix based on error message.**

---

## Complete File Reference

### Frontend Folder Structure

```
frontend/src/
├─ pages/                         ← User-facing screens
│  ├─ Login.jsx                   ← Login form
│  ├─ DonorRegistration.jsx       ← Sign up form
│  ├─ teacher/
│  │  ├─ TeacherDashboard.jsx
│  │  └─ SubmitWelfareRequest.jsx
│  ├─ principal/
│  │  ├─ PrincipalDashboard.jsx
│  │  └─ ReviewRequests.jsx
│  └─ donor/
│     ├─ DonorDashboard.jsx
│     ├─ BrowseWelfareRequests.jsx
│     └─ MakeDonation.jsx
│
├─ services/                      ← Backend API calls
│  ├─ apiClient.js                ← HTTP setup
│  ├─ authService.js              ← Auth API
│  └─ schoolService.js            ← School API
│
├─ context/                       ← Global state
│  └─ AuthContext.jsx             ← User/login state
│
├─ components/                    ← Reusable UI pieces
│  ├─ FileUploader.jsx            ← Upload component
│  ├─ ChangePassword.jsx          ← Password form
│  └─ ui/                         ← Pre-built components
│
├─ utils/                         ← Helper functions
│  ├─ tokenHelper.js              ← Token management
│  └─ passwordValidation.js       ← Password checking
│
└─ App.jsx                        ← Main app
```

### Backend Folder Structure

```
backend/
├─ routes/                        ← API endpoints
│  ├─ authRoutes.js               ← /auth endpoints
│  ├─ welfareRoutes.js            ← /welfare endpoints
│  ├─ donationRoutes.js           ← /donations endpoints
│  └─ ...
│
├─ controllers/                   ← Business logic
│  ├─ authController.js           ← Auth logic
│  ├─ welfareController.js        ← Welfare logic
│  ├─ donationController.js       ← Donation logic
│  └─ ...
│
├─ models/                        ← Database schemas
│  ├─ User.js
│  ├─ WelfareRequest.js
│  ├─ Donation.js
│  └─ ...
│
├─ middleware/                    ← Request processing
│  ├─ authMiddleware.js           ← Check login/permissions
│  ├─ errorHandler.js             ← Handle errors
│  └─ uploadMiddleware.js         ← Handle file uploads
│
├─ config/
│  ├─ db.js                       ← Database connection
│  └─ constants.js                ← Settings
│
└─ server.js                      ← Start server
```

---

## Quick Lookup Guide

| Feature | Frontend Page | Backend Route | Controller | Model |
|---------|---------------|---------------|------------|-------|
| Login | Login.jsx | authRoutes.js | authController.js | User.js |
| Sign Up | DonorRegistration.jsx | authRoutes.js | authController.js | User.js, Donor.js |
| Submit Request | SubmitWelfareRequest.jsx | welfareRoutes.js | welfareController.js | WelfareRequest.js |
| Approve Request | ReviewRequests.jsx | welfareRoutes.js | welfareController.js | WelfareRequest.js |
| Browse Requests | BrowseWelfareRequests.jsx | welfareRoutes.js | welfareController.js | WelfareRequest.js |
| Donate | MakeDonation.jsx | donationRoutes.js | donationController.js | Donation.js |
| Transfer Funds | ReceivedFunds.jsx | transferRoutes.js | transferController.js | Transfer.js |

---

**Now you can find any code in the codebase!** 🚀

When stuck:
1. Find frontend page
2. Follow API call
3. Find backend route
4. Find controller function
5. Check database model
6. Read the code

Good luck! 💪
