# 🎓 EduZone Beginner's Complete Guide

## Welcome! 👋

This guide explains **EVERY** part of the EduZone application in simple, beginner-friendly language. If you're new to programming, this will help you understand what each part does and how everything connects together.

---

## 📚 Table of Contents

1. [What is EduZone?](#what-is-eduzone)
2. [How Does It Work? (Big Picture)](#how-does-it-work-big-picture)
3. [The Four Types of Users](#the-four-types-of-users)
4. [Frontend vs Backend](#frontend-vs-backend)
5. [Authentication Flow (Login/Register)](#authentication-flow)
6. [Database: How Data is Stored](#database-how-data-is-stored)
7. [Key Features Explained](#key-features-explained)
8. [File-by-File Walkthrough](#file-by-file-walkthrough)
9. [How to Find Code for Any Feature](#how-to-find-code-for-any-feature)

---

## What is EduZone?

**EduZone** is a web application that connects schools, teachers, students, and donors to manage:
- **Welfare requests**: When students need financial help (for books, uniforms, fees)
- **Donations**: When donors want to contribute money to help students
- **Resources**: Educational materials teachers share
- **Transfers**: Moving donated money to schools
- **Reports**: Tracking what happens with funds

Think of it as a "matching platform" - it matches students in need with donors who want to help.

---

## How Does It Work? (Big Picture)

```
1. TEACHER → Creates welfare request for student who needs money
2. PRINCIPAL → Reviews and approves the request
3. ZEO → Final approval and publishes it
4. DONOR → Sees published request and donates money
5. SCHOOL → Receives funds and reports on how money was used
```

This happens in your **database** (where data lives) and is controlled by code in **backend** and **frontend**.

---

## The Four Types of Users

Every user in EduZone has one of 4 roles:

### 1. **DONOR** ❤️ (Individual or Organization)
- Can **register** for an account
- Can **browse** welfare requests needing funding
- Can **donate money** to help students
- Can **view** their donation history
- **Front-end pages**: Login → DonorDashboard → BrowseWelfareRequests → MakeDonation

### 2. **TEACHER** 👨‍🏫 (School Staff)
- Created by ZEO, not self-registration
- Can **submit** welfare requests for students in their school
- Can **track** status of requests they submitted
- Can **upload** educational resources
- Can **view** circulars (announcements)
- **Front-end pages**: Login → TeacherDashboard → SubmitWelfareRequest → TrackRequests

### 3. **PRINCIPAL** 👔 (School Leader)
- Created by ZEO
- Can **review** welfare requests from their school
- Can **approve/reject** requests
- Can **submit** monthly reports on fund usage
- Can **view** funds received
- **Front-end pages**: Login → PrincipalDashboard → ReviewRequests → SubmitReport

### 4. **ZEO** 🏛️ (System Administrator)
- System admin, created in database
- Can **create** teachers and principals for schools
- Can **approve** principal-approved requests (final approval)
- Can **publish** requests to donors
- Can **view** analytics and reports
- **Special privileges**: Full access to all data and features

---

## Frontend vs Backend

### **BACKEND** (server-side, what you can't see)
- **Location**: `/backend` folder
- **What it does**: Stores data, processes business logic, secures sensitive info
- **Technology**: Node.js + Express framework
- **Analogy**: Like the brain and storage room of a store

### **FRONTEND** (client-side, what you see)
- **Location**: `/frontend` folder
- **What it does**: Shows UI, handles user interactions, looks pretty
- **Technology**: React framework (JavaScript)
- **Analogy**: Like the store's display and cashier

### **How They Talk**
```
User clicks button
    ↓
Frontend (React) detects click
    ↓
Frontend sends HTTP request to Backend (asking for data/action)
    ↓
Backend receives request, processes it, updates database
    ↓
Backend sends response back to Frontend
    ↓
Frontend updates UI to show results
```

---

## Authentication Flow

### What is Authentication?
Authentication = "Proving you are who you say you are" = Login

### Donor Registration Flow (What Happens When Someone Clicks "Sign Up")

**FILE INVOLVED**: 
- Frontend: `frontend/src/pages/DonorRegistration.jsx` (the form)
- Backend: `backend/controllers/authController.js` → `registerDonor()` function

**STEP-BY-STEP**:

1. **User fills form on webpage** (DonorRegistration.jsx)
   - Name: "John Smith"
   - Email: "john@gmail.com"
   - Password: "MyPass123!"
   - Organization: "My Charity"

2. **User clicks "Register" button**
   - Frontend validates form (is email correct format? is password strong?)

3. **Frontend sends data to backend**
   ```
   POST /api/auth/register/donor
   {
     name: "John Smith",
     email: "john@gmail.com",
     password: "MyPass123!",
     organizationName: "My Charity"
   }
   ```

4. **Backend receives request at `authController.registerDonor()`**
   - Checks: Is email already registered? ❌ No, proceed
   - Validates password: ✅ Strong enough? Yes
   - **Hashes password** (converts to scrambled code so nobody can read it, even database admin)
   - Generates 6-digit verification code: "482739"
   - **Creates User record in database**
     ```
     User table: {
       id: 1,
       email: "john@gmail.com",
       passwordHash: "$2a$10$...", // encrypted
       role: "DONOR",
       isVerified: false
     }
     ```
   - **Creates Donor record in database**
     ```
     Donor table: {
       id: 1,
       userId: 1,
       organizationName: "My Charity"
     }
     ```

5. **Backend sends verification email**
   - Email received: "Your verification code is: 482739"
   - User receives email and enters code

6. **User enters code on frontend** (ActivateAccount.jsx or verification modal)

7. **Frontend sends code to backend**
   ```
   POST /api/auth/verify
   {
     email: "john@gmail.com",
     code: "482739"
   }
   ```

8. **Backend verifies code**
   - Looks up user by email
   - Checks: Does code match? ✅ Yes
   - Checks: Is code still valid (not expired)? ✅ Yes
   - Sets `isVerified = true`
   - **Creates JWT tokens** (proof of login)

9. **Backend returns tokens to frontend**
   ```
   {
     token: "eyJhbGciOiJIUzI1NiIsInR...", // 15-minute access token
     refreshToken: "eyJhbGciOiJIUzI1NiIsInR..." // 7-day refresh token
   }
   ```

10. **Frontend saves tokens**
    - Access token stored in `localStorage` (browser memory)
    - Refresh token also stored
    - User is now logged in!

### Login Flow (What Happens When You Click "Login")

**FILES INVOLVED**:
- Frontend: `frontend/src/pages/Login.jsx` (form)
- Backend: `backend/controllers/authController.js` → `loginUser()` function

**SIMPLE VERSION**:
1. User enters email + password
2. Frontend sends to backend
3. Backend checks: password correct?
4. If YES: Generate tokens and send back
5. Frontend stores tokens, user is logged in
6. Redirect to dashboard

### Token Refresh (Keeping User Logged In)

**The Problem**: Access token expires after 15 minutes. If user is working for 2 hours, they'd need to re-login 8 times - bad UX!

**The Solution**: Refresh token (valid for 7 days)

**How it works**:
1. Frontend runs timer checking: "When will access token expire?"
2. When expiring in 5 minutes, frontend automatically calls:
   ```
   POST /api/auth/refresh
   { refreshToken: "eyJhbGciOiJIUzI1..." }
   ```
3. Backend: "Is refresh token valid?" ✅ Yes
4. Backend generates NEW access token
5. Frontend updates stored token
6. User never knows it happened - seamless! ✓

**CODE**: `frontend/src/context/AuthContext.jsx` has this timer (see `useEffect` with refresh logic)

---

## Database: How Data is Stored

### What is a Database?
A database = organized data storage (like a filing cabinet with folders)

Your app uses **MySQL** database with **Sequelize** ORM (tool that lets JavaScript code talk to database)

### Main Tables (Collections of Data)

```
User Table
├─ id (1, 2, 3, ...)
├─ email ("john@gmail.com")
├─ passwordHash (encrypted password)
├─ role ("DONOR", "TEACHER", "PRINCIPAL", "ZEO")
├─ isVerified (true/false)
└─ ...

Donor Table
├─ id
├─ userId (links to User)
├─ organizationName ("My Charity")
└─ ...

Teacher Table
├─ id
├─ userId (links to User)
├─ schoolId (which school they work at)
└─ ...

School Table
├─ id
├─ name ("Lincoln High School")
├─ division ("District 5")
├─ bankAccount ("123456789")
└─ ...

WelfareRequest Table
├─ id
├─ studentName ("Ahmed")
├─ grade ("10-B")
├─ description ("Needs books")
├─ estimatedCost (5000)
├─ status ("SUBMITTED" → "PRINCIPAL_APPROVED" → "ZEO_APPROVED" → "PUBLISHED" → "FUNDED")
├─ studentId (links to Student)
├─ teacherId (which teacher submitted it)
└─ ...

Donation Table
├─ id
├─ amount (1000)
├─ donorId (which donor donated)
├─ requestId (which welfare request they're funding)
├─ paymentMethod ("Online", "Bank Transfer")
└─ ...

Transfer Table (moving money to school)
├─ id
├─ amount (5000)
├─ schoolId (which school gets money)
├─ status ("INITIATED" → "VERIFIED" → "TRANSFERRED")
└─ ...
```

### How Tables Connect (Relationships)

```
User ──┬──→ Donor
       ├──→ Teacher
       ├──→ Principal
       └──→ ... (etc)

Teacher ──→ School
Principal ──→ School
Teacher ──→ WelfareRequest (created it)
Student ──→ WelfareRequest (the one needing help)
WelfareRequest ──→ Donation (money donated to it)
Donation ──→ Donor (who donated)
School ──→ Transfer (money transferred to it)
```

---

## Key Features Explained

### 1. **Donor Registration & Login**

**What happens**:
- New donor visits website
- Fills registration form
- Gets verification email
- Enters verification code
- Account created, can login

**Files**:
- Frontend page: `DonorRegistration.jsx`
- Frontend pages: `Login.jsx`, `ActivateAccount.jsx`
- Backend: `authController.registerDonor()`, `authController.loginUser()`
- API endpoints: `POST /api/auth/register/donor`, `POST /api/auth/login`

**Database changes**:
- Creates User row
- Creates Donor row

---

### 2. **Teacher Submits Welfare Request**

**What happens**:
1. Teacher logs in
2. Clicks "Submit Request" button (TeacherDashboard.jsx)
3. Fills form: student name, grade, description, cost
4. Submits
5. Request created with status "SUBMITTED"

**Files**:
- Frontend: `SubmitWelfareRequest.jsx`
- Backend: `welfareController.createWelfareRequest()`
- API endpoint: `POST /api/welfare`

**Database changes**:
- Creates WelfareRequest row with `status: "SUBMITTED"`

---

### 3. **Principal Approves Welfare Request**

**What happens**:
1. Principal sees pending requests on dashboard
2. Reviews details (student, reason, amount)
3. Clicks "Approve" or "Reject"
4. Status changes to "PRINCIPAL_APPROVED" or "REJECTED"

**Files**:
- Frontend: Principal dashboard pages
- Backend: `welfareController.updateWelfareStatus()`
- API endpoint: `PUT /api/welfare/:id/status`

**Database changes**:
- Updates WelfareRequest row: `status: "PRINCIPAL_APPROVED"`

---

### 4. **ZEO Final Approval & Publish**

**What happens**:
1. ZEO sees principal-approved requests
2. Reviews them
3. Approves and "publishes" to donors
4. Request now visible to donors on "Browse Requests" page

**Files**:
- Backend: `welfareController.updateWelfareStatus()`

**Database changes**:
- Updates WelfareRequest row: `status: "PUBLISHED"`

---

### 5. **Donor Browses & Donates**

**What happens**:
1. Donor logs in
2. Clicks "Browse Requests" (or sees in dashboard)
3. Sees all published welfare requests
4. Selects one to donate to
5. Chooses amount: $100, $500, custom
6. Chooses payment method: Online, Bank Transfer
7. Submits donation
8. Payment processed, donation recorded

**Files**:
- Frontend: `BrowseWelfareRequests.jsx`, `MakeDonation.jsx`
- Backend: `donationController.submitDonation()`
- API endpoint: `POST /api/donations`

**Database changes**:
- Creates Donation row
- Updates WelfareRequest row: changes funding amount
- When fully funded, updates status to "FULLY_FUNDED"

---

### 6. **Transfer Funds to School**

**What happens**:
1. Principal sees: "Request fully funded!"
2. Clicks "Transfer to School"
3. Money transferred to school's bank account
4. Records proof of transfer
5. Report generated

**Files**:
- Backend: `transferController.initiateTransfer()`
- API endpoint: `POST /api/transfers`

**Database changes**:
- Creates Transfer row
- Updates WelfareRequest status to "TRANSFERRED"

---

## File-by-File Walkthrough

### Backend Structure

```
backend/
├─ routes/           ← API endpoint definitions
│  ├─ authRoutes.js          POST /auth/login, /auth/register, etc
│  ├─ welfareRoutes.js       POST /welfare (create), GET /welfare (list)
│  ├─ donationRoutes.js      POST /donations (submit donation)
│  ├─ transferRoutes.js      POST /transfers (move money to school)
│  └─ ... (other routes)
│
├─ controllers/      ← Business logic (what happens when route is called)
│  ├─ authController.js      registerDonor(), loginUser(), verifyEmail()
│  ├─ welfareController.js   createWelfareRequest(), updateStatus()
│  ├─ donationController.js  submitDonation(), getDonations()
│  ├─ transferController.js  initiateTransfer()
│  └─ ... (other controllers)
│
├─ models/          ← Database table definitions
│  ├─ User.js               Email, password, role
│  ├─ Donor.js              Organization name
│  ├─ Teacher.js            School assignment
│  ├─ School.js             School info, bank details
│  ├─ WelfareRequest.js      The welfare request data
│  ├─ Donation.js           Donation data
│  ├─ Transfer.js           Transfer data
│  └─ ... (other models)
│
├─ middleware/       ← Code that runs BEFORE each request
│  ├─ authMiddleware.js      Checks: Is user logged in? Do they have permission?
│  ├─ errorHandler.js        Catches errors and sends user-friendly messages
│  └─ uploadMiddleware.js    Handles file uploads
│
├─ config/
│  ├─ db.js                  Database connection setup
│  └─ constants.js           Settings (token expiry times, etc)
│
└─ server.js         ← Main entry point (starts the backend)
```

### Frontend Structure

```
frontend/
├─ src/
│  ├─ pages/                 ← Full page components (screens)
│  │  ├─ Login.jsx                   Login page
│  │  ├─ DonorRegistration.jsx       Sign up for donors
│  │  ├─ ForgotPassword.jsx          Password recovery
│  │  ├─ donor/
│  │  │  ├─ DonorDashboard.jsx       Donor home screen
│  │  │  ├─ BrowseWelfareRequests.jsx View available requests
│  │  │  └─ MakeDonation.jsx         Donation form
│  │  └─ teacher/
│  │     ├─ TeacherDashboard.jsx     Teacher home screen
│  │     └─ SubmitWelfareRequest.jsx Create welfare request
│  │
│  ├─ components/            ← Reusable pieces of UI
│  │  ├─ FileUploader.jsx            Upload files
│  │  ├─ ChangePassword.jsx          Change password form
│  │  ├─ LoadingSpinner.jsx          Loading animation
│  │  └─ ui/                          Pre-built button, form, etc
│  │
│  ├─ services/              ← How frontend talks to backend
│  │  ├─ apiClient.js               Sets up HTTP requests
│  │  ├─ authService.js             Auth API calls (login, register)
│  │  └─ schoolService.js           School API calls
│  │
│  ├─ context/               ← Shared data across all pages
│  │  └─ AuthContext.jsx            Stores: user, token, role globally
│  │
│  ├─ utils/                 ← Helper functions
│  │  ├─ tokenHelper.js             Save/load tokens from browser storage
│  │  └─ passwordValidation.js      Check if password is strong
│  │
│  └─ App.jsx                ← Main app file (sets up routing)
```

---

## How to Find Code for Any Feature

### Example 1: "I want to modify the Donation form"

**Question**: Which file controls the donation form?

**Answer**: `frontend/src/pages/donor/MakeDonation.jsx`

**Why**: 
- It's a page users see
- It's in `pages/` folder
- It's about donations
- It's in `/donor` (donor-specific page)

**What to look for in file**:
- Form inputs: `<Input>` or `<input>` tags
- Form submission: `handleSubmit()` or `handleDonate()` function
- API call: Look for `client.post('/donations')`

---

### Example 2: "When I click 'Transfer to School', what code runs?"

**Question**: Where is the transfer logic?

**Step 1**: Find the button in frontend
- Likely in: `PrincipalDashboard.jsx` or a related page
- Look for: `onClick={handleTransfer}` or similar

**Step 2**: Look at the function it calls
- Will probably have: `client.post('/transfers')`

**Step 3**: Find backend code that receives this request
- Look in: `backend/routes/transferRoutes.js`
- See: `router.post('/', asyncHandler(initiateTransfer));`

**Step 4**: Find the controller function
- Look in: `backend/controllers/transferController.js`
- Find: `const initiateTransfer = async (req, res) => { ... }`

**Step 5**: Read the function to understand what happens
- Updates database
- Calls bank API
- Sends confirmation email
- Etc

---

## Common Code Patterns You'll See

### Pattern 1: API Endpoint (Backend Route)

```javascript
// backend/routes/welfareRoutes.js
router.post('/', asyncHandler(createWelfareRequest));
        // ↑ HTTP method
         // ↑ URL path (becomes /api/welfare)
             // ↑ Error handling wrapper
                 // ↑ Function that runs
```

When request comes in:
1. `asyncHandler` catches errors
2. Calls `createWelfareRequest()` 
3. If error, sends error to client
4. If success, sends data to client

### Pattern 2: Controller Function (Backend Logic)

```javascript
// backend/controllers/welfareController.js
const createWelfareRequest = async (req, res) => {
    // 1. Get data from request
    const { studentName, cost } = req.body;
    
    // 2. Validate it
    if (!studentName) return res.status(400).json({ error: 'Name required' });
    
    // 3. Update database
    const request = await WelfareRequest.create({ ... });
    
    // 4. Send response
    res.status(201).json({ success: true, request });
};
```

### Pattern 3: Frontend API Call

```javascript
// frontend page (e.g., SubmitWelfareRequest.jsx)
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Prepare data
    const data = { studentName, cost, ... };
    
    // 2. Send to backend
    const response = await client.post('/welfare', data);
    
    // 3. Check result
    if (response.data.success) {
        toast.success('Request submitted!');
        navigate('/teacher/track-requests');
    } else {
        toast.error('Failed to submit');
    }
};
```

### Pattern 4: Global State (Context)

```javascript
// frontend/context/AuthContext.jsx
const [user, setUser] = useState(null);  // Stores logged-in user info
const [token, setToken] = useState(null); // Stores JWT token

// Any component can access:
const { user, token, logout } = useAuth();
// Now can use user.name, user.role, etc in JSX
```

---

## FAQ for Beginners

### Q: What's a "request" in `req.body`?

A: `req` = request from frontend. `req.body` = the data frontend sent with request.

Example:
```javascript
// Frontend sends:
client.post('/welfare', { studentName: 'Ahmed', cost: 5000 });

// Backend receives:
const { studentName, cost } = req.body;  // Gets: 'Ahmed' and 5000
```

### Q: What does `res.json()` do?

A: Sends data back to frontend.

Example:
```javascript
// Backend sends:
res.json({ success: true, userId: 1 });

// Frontend receives:
// response.data = { success: true, userId: 1 }
```

### Q: What's the difference between POST, GET, PUT, DELETE?

- `POST` = Create something new
- `GET` = Retrieve/read data
- `PUT` = Update existing data
- `DELETE` = Remove data

### Q: Why do we hash passwords?

A: If database is stolen, hackers can't read plain passwords. Hashed passwords are one-way encryption.

```
Plain: "MyPass123!"  → bcrypt.hash() → Hashed: "$2a$10$..."
Can't reverse it back!
```

### Q: What's JWT?

A: JWT = "JSON Web Token" = Proof you logged in

```
1. You login with email+password ✓
2. Backend creates JWT: "eyJ0eXAiOiJKV1Q..." (contains user ID, role, expiry)
3. Frontend stores this JWT
4. Every request includes JWT: "Prove you're user #5"
5. Backend verifies JWT: "Yep, this is really user #5!"
6. Request allowed!
```

---

## Next Steps

1. **Read the code**: Pick a file from the file structure above and read through it
2. **Make a small change**: Try modifying some text on a page
3. **Understand one feature**: Pick "Donor Registration" and trace through all files involved
4. **Ask questions**: When you see code you don't understand, look for comments (documentation)

---

## Getting Help

When you're confused about code:

1. Look for comments in the file (lines starting with `//` or `/* */`)
2. Look at filenames - they usually describe what the file does
3. Look at function names - they usually describe what the function does
4. Search for the word in Ctrl+F in the file
5. Search across entire codebase in VS Code sidebar

---

**You're not alone!** Programming has a learning curve. Take your time, read code carefully, and over time it will click. Good luck! 🚀
