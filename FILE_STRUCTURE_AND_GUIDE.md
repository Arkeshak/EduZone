# 📂 EduZone Project - Complete File Structure & Documentation

## Quick Navigation

- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [File Dependencies](#file-dependencies)
- [How to Find Things](#how-to-find-things)

---

## 🔙 Backend Structure

### `/backend` - Main Directory

```
backend/
├── config/                    # Configuration files
│   ├── constants.js          # App-wide configuration & validation rules
│   └── db.js                 # Database connection setup
│
├── models/                   # Database models (Sequelize ORM)
│   ├── index.js              # Central model registry & associations
│   ├── User.js               # User authentication & base entity
│   ├── WelfareRequest.js     # Core business entity (student needs)
│   ├── WelfareApproval.js    # Audit trail for welfare requests
│   ├── WelfareRequestDocument.js  # Files attached to requests
│   ├── Donation.js           # Donation records (funding)
│   ├── Donor.js              # Donor profile data
│   ├── Transfer.js           # Fund transfer records
│   ├── School.js             # School information
│   ├── Principal.js          # Principal profile
│   ├── Teacher.js            # Teacher profile
│   ├── TeacherSubject.js     # Many-to-many: Teacher <-> Subject
│   ├── Subject.js            # Academic subjects
│   ├── Student.js            # Student records
│   ├── Resource.js           # Educational resources (docs, videos)
│   ├── Circular.js           # Announcements
│   ├── CircularRecipient.js  # Who received which circular
│   ├── CircularAttachment.js # Files attached to circulars
│   ├── MonthlyReport.js      # Generated reports
│   ├── Notification.js       # In-app notifications
│   └── PasswordReset.js      # Password reset tokens
│
├── controllers/              # Business logic (handles requests)
│   ├── authController.js     # Login, register, token management
│   ├── welfareController.js  # Welfare request lifecycle
│   ├── donationController.js # Donation management & verification
│   ├── schoolController.js   # School operations
│   ├── resourceController.js # Resource management
│   ├── circularController.js # Announcement management
│   ├── reportController.js   # Report generation
│   └── transferController.js # Fund transfer processing
│
├── middleware/               # Request processing (before routes)
│   ├── authMiddleware.js     # protect() & authorize() for security
│   ├── errorHandler.js       # asyncHandler() wrapper & error handling
│   ├── validation.js         # Input validation rules (express-validator)
│   ├── sanitization.js       # Input sanitization (XSS prevention)
│   └── uploadMiddleware.js   # File upload handling
│
├── routes/                   # URL endpoint definitions
│   ├── authRoutes.js         # GET/POST /api/auth/*
│   ├── welfareRoutes.js      # GET/POST /api/welfare/*
│   ├── donationRoutes.js     # GET/PATCH /api/donations/*
│   ├── schoolRoutes.js       # GET /api/schools/*
│   ├── resourceRoutes.js     # GET/POST /api/resources/*
│   ├── circularRoutes.js     # GET/POST /api/circulars/*
│   ├── reportRoutes.js       # GET /api/reports/*
│   └── transferRoutes.js     # POST /api/transfers/*
│
├── utils/                    # Helper utilities
│   └── sendEmail.js          # Email sending (nodemailer)
│
├── seeders/                  # Database initialization scripts
│   ├── InitialSeeder.js      # Create initial ZEO user
│   └── LegacySeeder.js       # Import existing data
│
├── tests/                    # Jest test suite
│   ├── setup.js              # Test configuration & database setup
│   └── api/                  # API endpoint tests
│       ├── auth.test.js
│       ├── welfare.test.js
│       ├── donations.test.js
│       ├── schools.test.js
│       ├── resources.test.js
│       ├── transfers.test.js
│       ├── circulars.test.js
│       └── reports.test.js
│
├── uploads/                  # User-uploaded files (images, docs)
│
├── server.js                 # Main Express app entry point
├── package.json              # Dependencies & npm scripts
├── jest.config.js            # Jest testing configuration
├── .env                      # Environment variables (NOT in git)
├── .env.example              # Template for .env
└── .gitignore                # What to exclude from git

```

### 📋 Key Backend Files Explained

#### 1. **server.js** (Main Entry Point)
- Sets up Express app
- Configures all middleware (security, validation, auth)
- Mounts all routes
- Connects to database
- Starts server on PORT 5000

#### 2. **models/index.js** (Database Structure)
- Imports all models
- **Defines all relationships** (User → Principal → School)
- Creates associations (hasMany, belongsTo, belongsToMany)
- Essential for understanding data structure

#### 3. **controllers/** (Business Logic)
- Each controller handles a domain (auth, welfare, donations)
- Controllers have functions like: createRequest, approveRequest, verifyDonation
- Controllers use models to query/update database
- Controllers call services (sendEmail)

#### 4. **middleware/** (Request Interceptors)
- **authMiddleware.js**: Verifies JWT token, loads user, checks authorization
- **validation.js**: Validates request data (fields, types, lengths)
- **errorHandler.js**: Catches all errors, formats responses
- **sanitization.js**: Removes malicious input

#### 5. **routes/** (URL Mappings)
- Maps POST /api/welfare → welfareController.createRequest
- Chains middleware: validation → authentication → authorization → handler
- Must match exactly for request to reach the handler

---

## 🎨 Frontend Structure

### `/frontend` - Main Directory

```
frontend/
├── src/
│   ├── App.jsx               # Root React component
│   ├── main.jsx              # App entry point (mounts to DOM)
│   │
│   ├── context/              # Global state management (React Context)
│   │   └── AuthContext.jsx   # Authentication state (user, role, login, logout)
│   │
│   ├── routes/               # URL routing
│   │   ├── AppRouter.jsx     # Route definitions
│   │   └── ProtectedRoute.jsx # Route guard (requires authentication)
│   │
│   ├── pages/                # Full page components (screens)
│   │   ├── Home.jsx
│   │   ├── Login.jsx         # User login page
│   │   ├── ActivateAccount.jsx  # Email verification
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Unauthorized.jsx
│   │   ├── NotFound.jsx
│   │   ├── PublicResources.jsx
│   │   │
│   │   ├── teacher/          # Teacher-specific pages
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── SubmitWelfare.jsx
│   │   │   └── MyRequests.jsx
│   │   │
│   │   ├── principal/        # Principal-specific pages
│   │   │   ├── PrincipalDashboard.jsx
│   │   │   ├── ApprovingRequests.jsx
│   │   │   └── SchoolManagement.jsx
│   │   │
│   │   ├── zeo/              # ZEO (District Admin) pages
│   │   │   ├── ZEODashboard.jsx
│   │   │   ├── PublishRequests.jsx
│   │   │   ├── VerifyDonations.jsx
│   │   │   └── ProcessTransfers.jsx
│   │   │
│   │   └── donor/            # Donor portal pages
│   │       ├── DonorDashboard.jsx
│   │       ├── BrowseRequests.jsx
│   │       └── MyDonations.jsx
│   │
│   ├── components/           # Reusable UI components
│   │   ├── ChangePassword.jsx   # Shared component
│   │   ├── FileUploader.jsx     # File upload UI
│   │   ├── ImageWithFallback.jsx # Image with default
│   │   ├── LoadingSpinner.jsx    # Loading indicator
│   │   ├── StatusBadge.jsx       # Status display
│   │   └── ui/                  # Shadcn/ui components
│   │       ├── accordion.jsx
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       └── ... (other UI primitives)
│   │
│   ├── layouts/              # Page layout wrappers
│   │   └── DashboardLayout.jsx  # Sidebar + main content
│   │
│   ├── services/             # API communication layer
│   │   ├── apiClient.js      # Axios instance with token management
│   │   ├── authService.js    # Authentication API calls
│   │   ├── schoolService.js  # School API calls
│   │   └── axiosConfig.js    # Axios configuration
│   │
│   ├── utils/                # Helper utilities
│   │   ├── tokenHelper.js    # Token storage & utility functions
│   │   ├── passwordValidation.js # Password strength checking
│   │   └── subjects.js       # Subject list data
│   │
│   ├── styles/               # CSS files
│   │   ├── index.css         # Global styles
│   │   ├── fonts.css         # Font definitions
│   │   ├── theme.css         # Color & spacing theme
│   │   └── tailwind.css      # Tailwind CSS utilities
│   │
│   └── assets/               # Images, icons, etc.
│
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.js            # Vite bundler configuration
├── postcss.config.mjs         # CSS processing
├── .env                      # Environment variables (NOT in git)
└── .gitignore                # What to exclude from git

```

### 📋 Key Frontend Files Explained

#### 1. **main.jsx** (Entry Point)
- Mounts React app to `<div id="root">`
- Wraps app in providers (Router, AuthProvider)
- First file executed in browser

#### 2. **App.jsx** (Root Component)
- Main React component
- Imports RouterView
- Can be used for global toast/modal providers

#### 3. **context/AuthContext.jsx** (Global Auth State)
- Manages: user, role, loading, isAuthenticated
- Provides: login(), logout()
- Handles: Proactive token refresh every 60s
- Used by: useAuth() hook in any component

#### 4. **routes/AppRouter.jsx** (URL Routing)
- Defines all routes
- Protected vs public routes
- Role-based route access
- Uses React Router (BrowserRouter, Routes, Route)

#### 5. **pages/** (Screen Components)
- Each file is a full page
- Example: Login.jsx renders login form
- Components use useAuth() to get data

#### 6. **services/apiClient.js** (API Communication)
- Axios instance (like fetch, but better)
- Automatically attaches JWT token
- Handles token expiration + refresh
- Intercepts 401 errors

#### 7. **utils/tokenHelper.js** (Token Management)
- Functions to save/get/remove tokens
- Functions to decode JWT
- Functions to check token expiration

---

## 🗄️ Database Models (Complete Reference)

### User Model
```javascript
User {
  id: PRIMARY KEY
  fullName: STRING
  email: STRING UNIQUE
  passwordHash: STRING (bcrypt hashed)
  role: ENUM ['ZEO', 'PRINCIPAL', 'TEACHER', 'DONOR']
  isVerified: BOOLEAN (email verified?)
  isActive: BOOLEAN (account active?)
  activationToken: STRING (6-digit code for email verification)
  activationExpires: DATE (when activation code expires)
  refreshToken: STRING (optional, for logout tracking)
  timestamps: createdAt, updatedAt
}

// One User can have ONE of:
// - Principal profile
// - Teacher profile
// - Donor profile
```

### WelfareRequest Model (Core Entity)
```javascript
WelfareRequest {
  id: PRIMARY KEY
  referenceCode: STRING UNIQUE (e.g., "WR-20250416-001")
  studentId: FOREIGN KEY → Student
  teacherId: FOREIGN KEY → Teacher (submitted by)
  schoolId: FOREIGN KEY → School
  
  // Request details
  category: ENUM ['Supplies', 'Fees', 'Medical', 'Transport', 'Equipment', 'Hostel', 'Food', 'Books', 'Uniforms', 'Other']
  description: TEXT (why student needs help)
  amountRequired: DECIMAL (how much needed)
  priority: ENUM ['LOW', 'MEDIUM', 'HIGH']
  
  // State machine (workflow)
  status: ENUM [
    'SUBMITTED',
    'PRINCIPAL_APPROVED',
    'ZEO_APPROVED',
    'PUBLISHED',
    'PARTIALLY_FUNDED',
    'FULLY_FUNDED',
    'TRANSFERRED',
    'REJECTED'
  ]
  
  // Relations
  donations: [Donation] (many)
  approvals: [WelfareApproval] (audit trail)
  transfers: [Transfer] (fund movements)
}
```

### Donation Model
```javascript
Donation {
  id: PRIMARY KEY
  donorId: FOREIGN KEY → Donor (who donated)
  welfareRequestId: FOREIGN KEY → WelfareRequest (to which request)
  schoolId: FOREIGN KEY → School (direct donation option)
  
  amount: DECIMAL
  paymentMethod: ENUM ['ONLINE', 'BANK_TRANSFER']
  paymentReference: STRING
  
  // Verification
  status: ENUM ['PENDING', 'VERIFIED', 'REJECTED', 'PENDING_REVIEW']
  verifiedBy: FOREIGN KEY → User (which ZEO verified)
  verifiedAt: DATE
  
  // Audit
  timestamps: createdAt, updatedAt
}
```

### Transfer Model
```javascript
Transfer {
  id: PRIMARY KEY
  welfareRequestId: FOREIGN KEY → WelfareRequest
  donationId: FOREIGN KEY → Donation
  schoolId: FOREIGN KEY → School (receiving school)
  transferredBy: FOREIGN KEY → User (which ZEO approved)
  
  amount: DECIMAL
  referenceNumber: STRING UNIQUE
  status: ENUM ['PENDING', 'COMPLETED', 'FAILED']
  notes: TEXT
  
  transferredAt: DATE
  timestamps: createdAt, updatedAt
}
```

---

## 🔌 API Endpoints (Complete Reference)

### Authentication Routes
```
POST   /api/auth/donor/register        Create donor account (public)
POST   /api/auth/verify                Verify email code (public)
POST   /api/auth/login                 User login (public)
POST   /api/auth/refresh               Get new access token (public)
POST   /api/auth/logout                Clear session (protected)
POST   /api/auth/forgot-password       Send reset email (public)
POST   /api/auth/reset-password        Reset password (public)
POST   /api/auth/create-staff          Create principal/teacher (ZEO only)
POST   /api/auth/change-password       Change password (protected)
```

### Welfare Routes
```
POST   /api/welfare                    Create request (teacher only)
GET    /api/welfare                    List requests (paginated, protected)
GET    /api/welfare/:id                Get request details (protected)
PATCH  /api/welfare/:id/status         Update status (principal/ZEO only)
GET    /api/welfare/:id/approvals      View audit trail (protected)
```

### Donation Routes
```
POST   /api/donations                  Create donation (donor only)
GET    /api/donations                  List donations (paginated, protected)
GET    /api/donations/stats            Get statistics (protected)
PATCH  /api/donations/:id/verify       Verify donation (ZEO only)
DELETE /api/donations/:id              Cancel donation (donor only)
```

### School Routes
```
GET    /api/schools                    List all schools (protected)
GET    /api/schools/my-school          Get principal's school (principal only)
POST   /api/schools                    Create school (ZEO only)
PATCH  /api/schools/:id                Update school (ZEO only)
```

### Resource Routes
```
POST   /api/resources                  Upload resource (teacher only)
GET    /api/resources?public=true      Get public resources (public)
GET    /api/resources/my-resources     Get my resources (teacher only)
DELETE /api/resources/:id              Delete resource (teacher only)
```

### Transfer Routes
```
POST   /api/transfers                  Create transfer (ZEO only)
GET    /api/transfers                  List transfers (paginated, protected)
PATCH  /api/transfers/:id/status       Update transfer (ZEO only)
```

---

## 🔗 File Dependencies (How They Connect)

### Authentication Flow
```
1. Frontend: pages/Login.jsx
   ↓
2. Calls: services/authService.js → post('/api/auth/login')
   ↓
3. Backend: routes/authRoutes.js → POST /api/auth/login
   ↓
4. Middleware: validation → authentication check
   ↓
5. Controller: controllers/authController.js → login()
   ↓
6. Models: User.findOne() → verify password → generateTokens()
   ↓
7. Response: { token, refreshToken }
   ↓
8. Frontend: services/apiClient.js stores tokens
   ↓
9. Context: AuthContext.jsx → login() → setUser & setRole
```

### Welfare Request Creation Flow
```
1. Frontend: pages/teacher/SubmitWelfare.jsx
   ↓
2. Calls: services/apiClient.js → post('/api/welfare', {form data})
   ↓
3. Middleware: apiClient attaches token
   ↓
4. Backend: routes/welfareRoutes.js
   ↓
5. Middleware: 
   - authMiddleware.protect() → validates token
   - authMiddleware.authorize('TEACHER') → checks role
   - validation.js → validates form data
   - errorHandler catches errors
   ↓
6. Controller: controllers/welfareController.js → createRequest()
   ↓
7. Database transaction:
   a. Models/Teacher.js → find teacher profile
   b. Models/School.js → get teacher's school
   c. Models/Student.js → find/create student
   d. Models/WelfareRequest.js → create request
   e. Models/WelfareApproval.js → create audit entry
   ↓
8. Response: { success: true, data: { id, referenceCode, status, ... } }
   ↓
9. Frontend: Toast notification + navigate to my requests
```

### Donation Verification Flow
```
1. Frontend: pages/zeo/VerifyDonations.jsx
   ↓
2. Calls: services/apiClient.js → patch('/api/donations/5/verify', { status: 'VERIFIED' })
   ↓
3. Backend: routes/donationRoutes.js
   ↓
4. Middleware:
   - authMiddleware.protect() → verify token
   - authMiddleware.authorize('ZEO') → check ZEO role
   - validation.js → validate status param
   ↓
5. Controller: controllers/donationController.js → verifyDonation()
   ↓
6. Database transaction:
   a. Models/Donation.js → update status = 'VERIFIED'
   b. Models/WelfareApproval.js → create audit entry
   c. Models/Notification.js → notify donor
   d. Calculate total funded:
      - Models/Donation.js → findAll VERIFIED donations for request
      - Sum amounts
   e. If fully funded:
      - Models/WelfareRequest.js → update status = 'FULLY_FUNDED'
   ↓
7. Commit transaction (all or nothing)
   ↓
8. Response: { success: true, message: 'Donation verified', donation: {...} }
   ↓
9. Frontend: Update UI, show new welfare request status
```

---

## 🔍 How to Find Things

### "I need to add a new API endpoint"
1. Create validation rules in: `backend/middleware/validation.js`
2. Create route in: `backend/routes/newFeature.js`
3. Create/update controller in: `backend/controllers/newFeatureController.js`
4. Mount route in: `backend/server.js` → `app.use('/api/feature', ...)`
5. Create frontend service in: `frontend/src/services/newFeatureService.js`
6. Use in component with: `const response = await apiClient.post('/api/feature')`

### "I need to change a database model"
1. Edit model file: `backend/models/ModelName.js`
2. If adding field: Update migration/seeder if needed
3. Update associations in: `backend/models/index.js` if relationships changed
4. Update controllers that use this model

### "I need to fix authentication"
1. Backend JWT logic: `backend/controllers/authController.js`
2. Backend token verification: `backend/middleware/authMiddleware.js`
3. Frontend token storage: `frontend/src/utils/tokenHelper.js`
4. Frontend token management: `frontend/src/services/apiClient.js`
5. Frontend auth state: `frontend/src/context/AuthContext.jsx`

### "I need to add validation"
1. Go to: `backend/middleware/validation.js`
2. Add new validation rules using express-validator
3. Add to route: `router.post('/path', validationRules.newRule(), validate, handler)`

### "I need to change UI"
1. Find page in: `frontend/src/pages/`
2. Update component JSX
3. Import components from: `frontend/src/components/`
4. Call API using: `frontend/src/services/apiClient.js`
5. Get auth data using: `const { user, role } = useAuth()`

### "I need to fix a bug"
1. Check errors in: `backend/server.js` logs or frontend console
2. Frontend: Browser DevTools → Console tab
3. Backend: Check logs when running `npm test` or `npm start`
4. Database query issues: Check Sequelize logs
5. Add debug logs: `console.log('[DEBUG]', variableName)`

---

## 📊 File Size Reference

```
LARGE files (1000+ lines):
- controllers/donationController.js
- controllers/welfareController.js
- middleware/validation.js
- models/index.js

MEDIUM files (300-1000 lines):
- controllers/authController.js
- middleware/authMiddleware.js
- services/apiClient.js

SMALL files (< 300 lines):
- routes/*
- models/* (except index.js)
- pages/*
- components/*
```

---

## 🎯 Key Takeaways

1. **Backend handles**: Security, validation, business logic, database
2. **Frontend handles**: User interface, state management, API calls
3. **Models**: Define data structure, relations, validations
4. **Controllers**: Business logic (what happens with the data)
5. **Routes**: URL mappings (which URL calls which controller)
6. **Middleware**: Pre-processing (validation, auth, error handling)
7. **Context**: Global state (login/logout, user data)
8. **Services**: API communication (axios instance)

---

**Document Version:** 1.0  
**Last Updated:** April 16, 2025  
**Status:** ✅ Complete Reference
