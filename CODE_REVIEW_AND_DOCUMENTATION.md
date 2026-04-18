# 📚 EduZone Project - Complete Code Review & Documentation

## 🎯 Project Overview

**EduZone** is a comprehensive educational welfare management system designed to facilitate:
- 🎓 Student welfare request management
- 💰 Donation collection and verification
- 📚 Resource sharing among schools
- 📢 Circular announcements
- 📊 Reporting and analytics

### **System Architecture: 4-Tier Multi-Role System**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌─────────────┬─────────────┬──────────────┬──────────────┐ │
│  │   Teacher   │  Principal  │     ZEO      │     Donor    │ │
│  │   Portal    │   Portal    │   Dashboard  │   Platform   │ │
│  └─────────────┴─────────────┴──────────────┴──────────────┘ │
└──────────────────────────────────────────────────────────────┘
                            ↕ (JWT Auth)
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│  ┌──────────────┬──────────────┬──────────────────────────┐  │
│  │  Controllers │   Middleware │      Services/Utils      │  │
│  │  & Business  │   (Auth,     │  (Email, Transaction     │  │
│  │    Logic     │   Validation)│   Management)            │  │
│  └──────────────┴──────────────┴──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL + Sequelize)               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  22 Models: User, School, Teacher, WelfareRequest,      │ │
│  │  Donation, Transfer, Circular, Resources, etc.          │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Model Relationships

### **Core Models Overview**

```javascript
// Model Hierarchy (simplified)
User (Central Auth)
├── Principal (1:1)
│   └── School (1:1)
│       ├── Teachers (1:N)
│       ├── Students (1:N)
│       └── WelfareRequests (1:N)
├── Teacher (1:1)
│   ├── School (1:1)
│   ├── WelfareRequests (1:N) [submitter]
│   └── Resources (1:N)
├── Donor (1:1)
│   └── Donations (1:N)
└── ZEO (implied from role)
    └── Manages global operations

// Key Relationships
WelfareRequest (1:N)
├── Donations (1:N) [funding]
├── Transfers (1:N) [movement of funds]
└── WelfareApprovals (1:N) [audit trail]
```

---

## 🔐 Authentication & Authorization System

### **Token Architecture**

```javascript
/*
 * DUAL-TOKEN SYSTEM FOR ENHANCED SECURITY
 * 
 * Access Token (Short-lived):
 *   - Expires in 15 minutes
 *   - Contains: id, role, type='access'
 *   - Used for API requests
 *   - Low risk if compromised (short window)
 * 
 * Refresh Token (Long-lived):
 *   - Expires in 7 days
 *   - Contains: id, type='refresh'
 *   - Never sent to API endpoints (only to /auth/refresh)
 *   - Higher security (not included in every request)
 */

// Backend: generateAccessToken()
const generateAccessToken = (user) => {
    return jwt.sign({
        type: 'access',        // Identifies token purpose
        id: user.id,           // User ID for lookups
        role: user.role        // User's role for authorization
    }, ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',      // 15 minute expiration
        issuer: 'EduZone',     // Token issuer
        audience: 'EduZone'    // Token audience
    });
};

// Backend: generateRefreshToken()
const generateRefreshToken = (user) => {
    return jwt.sign({
        type: 'refresh',       // Identifies as refresh token
        id: user.id            // Minimal claims for security
    }, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',       // 7 day expiration
        issuer: 'EduZone',
        audience: 'EduZone'
    });
};
```

### **Authentication Flow (Detailed)**

```
1. DONOR REGISTRATION
   ├─ POST /api/auth/donor/register
   ├─ Validate password strength (8+ chars, uppercase, lowercase, number, special)
   ├─ Hash password with bcrypt (10 salt rounds)
   ├─ Create User record with role='DONOR', isVerified=false
   ├─ Create Donor profile (organizationName)
   ├─ Generate 6-digit verification code (valid 15 min)
   ├─ Send verification email
   └─ Return success

2. EMAIL VERIFICATION
   ├─ POST /api/auth/verify
   ├─ Validate verification code matches activationToken
   ├─ Check code hasn't expired (activationExpires)
   ├─ Set isVerified=true, clear activation fields
   ├─ Generate Access Token + Refresh Token
   └─ Return both tokens to frontend

3. LOGIN
   ├─ POST /api/auth/login
   ├─ Find user by email
   ├─ Compare password using bcrypt.compare()
   ├─ Check user.isActive && user.isVerified
   ├─ Generate new Access + Refresh tokens
   ├─ Store Refresh token in database (optional, for logout tracking)
   └─ Return { token, refreshToken }

4. TOKEN REFRESH (When access token expires)
   ├─ POST /api/auth/refresh
   ├─ Receive refreshToken from frontend
   ├─ Verify refreshToken with REFRESH_TOKEN_SECRET
   ├─ Ensure token.type === 'refresh'
   ├─ Generate new Access Token
   ├─ Optionally generate new Refresh Token (rotation)
   └─ Return { token, refreshToken }

5. PROTECTED REQUEST (Every API call with auth)
   ├─ Frontend attaches: Authorization: Bearer <accessToken>
   ├─ Backend authMiddleware.protect() intercepts
   ├─ Extracts token from header
   ├─ Verifies with ACCESS_TOKEN_SECRET
   ├─ Checks token.type === 'access'
   ├─ Loads User from database
   ├─ Attaches user to req.user
   └─ Continues to route handler
```

### **Frontend Token Lifecycle (Proactive Refresh)**

```javascript
/*
 * PROACTIVE TOKEN REFRESH MECHANISM
 * 
 * Why: Prevents expired tokens from blocking user actions
 * How: Checks every 60 seconds if token expires within 5 minutes
 * 
 * Benefits:
 * - Users never see "Token Expired" errors during normal use
 * - Seamless background token management
 * - Better UX with no forced logouts
 */

// 1. AuthContext.jsx - Proactive Refresh Every 60s
useEffect(() => {
    const refreshInterval = setInterval(async () => {
        const token = getToken();
        const refreshToken = getRefreshToken();

        // Check if token is expiring soon (within 5 minutes)
        if (token && refreshToken && isTokenExpiring(token, 5)) {
            if (!isRefreshing) {
                try {
                    setIsRefreshing(true);
                    const response = await client.post('/auth/refresh', { refreshToken });
                    if (response.data.token) {
                        saveToken(response.data.token);  // Save new access token
                        if (response.data.refreshToken) {
                            saveRefreshToken(response.data.refreshToken);  // Save new refresh token
                        }
                    }
                } catch (err) {
                    console.error('Token refresh failed:', err);
                    handleLogout();  // Force logout if refresh fails
                }
            }
        }
    }, 60000);  // Check every 60 seconds

    return () => clearInterval(refreshInterval);
}, [isRefreshing]);

// 2. apiClient.js - Request Interceptor (Additional Safety)
client.interceptors.request.use(async (config) => {
    let token = getToken();
    const refreshToken = getRefreshToken();

    // Additional check before sending each request
    if (token && isTokenExpiring(token, 5)) {
        // Refresh if expiring soon
    }

    // Attach token to all requests
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Response Interceptor (Fallback Handling)
client.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401) {
            // Token rejected by backend
            // Try to refresh or logout
        }
    }
);
```

---

## 🛣️ Welfare Request Workflow (State Machine)

### **Complete Workflow Diagram**

```
Teacher Submits Request
        ↓
    SUBMITTED (Status: SUBMITTED)
        ↓ (Principal Action)
    PRINCIPAL_APPROVED (Status: PRINCIPAL_APPROVED)
        ↓ (ZEO Action)
    ZEO_APPROVED (Status: ZEO_APPROVED)
        ↓ (ZEO Publish)
    PUBLISHED (Status: PUBLISHED)  ←─ Donors view & contribute
        ↓ (Donations arrive)
    PARTIALLY_FUNDED or FULLY_FUNDED
        ↓ (When funding complete)
    TRANSFERRED (Status: TRANSFERRED) ← Terminal state


OR AT ANY STAGE: REJECTED (Terminal state)
```

### **State Machine Logic**

```javascript
// backend/controllers/welfareController.js
const VALID_TRANSITIONS = {
    'SUBMITTED': ['PRINCIPAL_APPROVED', 'REJECTED'],
    'PRINCIPAL_APPROVED': ['ZEO_APPROVED', 'REJECTED'],
    'ZEO_APPROVED': ['PUBLISHED', 'REJECTED'],
    'PUBLISHED': ['PARTIALLY_FUNDED', 'FULLY_FUNDED', 'REJECTED'],
    'PARTIALLY_FUNDED': ['FULLY_FUNDED', 'REJECTED'],
    'FULLY_FUNDED': ['TRANSFERRED', 'REJECTED'],
    'TRANSFERRED': [],  // No transitions (terminal)
    'REJECTED': []      // No transitions (terminal)
};

// ✅ Rule: Status changes must follow this map
// ✅ Rule: Invalid transitions are rejected
// ✅ Rule: Only allowed roles can perform transitions
const validateStatusTransition = (currentStatus, newStatus, userRole) => {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
        return { valid: false, error: 'Invalid transition' };
    }
    
    // Role-based restrictions
    if (userRole === 'PRINCIPAL' && !['PRINCIPAL_APPROVED', 'REJECTED'].includes(newStatus)) {
        return { valid: false, error: 'Principal can only approve/reject' };
    }
    
    return { valid: true };
};
```

---

## 💰 Donation & Funding System

### **Donation Verification Process**

```javascript
/*
 * DONATION VERIFICATION ENDPOINT (ZEO only)
 * Purpose: Verify donations are legitimate and update welfare request funding status
 * 
 * Flow:
 * 1. ZEO receives list of donations with status
 * 2. Validates each donation status (VERIFIED/REJECTED/PENDING_REVIEW)
 * 3. Creates audit trail in WelfareApproval table
 * 4. Sends notifications to donor
 * 5. Updates WelfareRequest status based on total funding
 */

// PATCH /api/donations/:id/verify
const verifyDonation = async (req, res) => {
    const { status } = req.body;  // VERIFIED, REJECTED, or PENDING_REVIEW
    
    // ✅ Validate status is one of allowed values
    const upperStatus = (status || '').toUpperCase();
    const validStatuses = ['VERIFIED', 'REJECTED', 'PENDING_REVIEW'];
    if (!validStatuses.includes(upperStatus)) {
        return res.status(400).json({ 
            success: false, 
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
    }

    // Start transaction (all-or-nothing update)
    const transaction = await sequelize.transaction();

    try {
        // Find donation
        const donation = await Donation.findByPk(donationId, { transaction });
        if (!donation) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }

        // Update donation status
        donation.status = upperStatus;
        donation.verifiedBy = req.user.id;  // Track who verified
        donation.verifiedAt = new Date();
        await donation.save({ transaction });

        // ✅ Create audit trail
        await WelfareApproval.create({
            welfareRequestId: donation.welfareRequestId,
            approvedBy: req.user.id,
            status: upperStatus,
            notes: `Donation #${donation.id} verified`
        }, { transaction });

        // ✅ Send notification to donor
        const donor = await donation.getDonor({ transaction });
        if (donor && donor.id) {
            await Notification.create({
                userId: donor.id,
                type: 'DONATION_VERIFIED',
                message: `Your donation has been ${upperStatus.toLowerCase()}`
            }, { transaction });
        }

        // ✅ Calculate total funding for welfare request
        const welfareRequest = await donation.getRequest({ transaction });
        const allDonations = await welfareRequest.getDonations({ transaction });
        
        const totalFunded = allDonations
            .filter(d => d.status === 'VERIFIED')
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);

        // Update welfare request status if necessary
        if (totalFunded >= welfareRequest.amountRequired) {
            welfareRequest.status = 'FULLY_FUNDED';
        } else if (totalFunded > 0) {
            welfareRequest.status = 'PARTIALLY_FUNDED';
        }
        await welfareRequest.save({ transaction });

        // Commit all changes
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Donation verified as ${upperStatus}`,
            donation
        });
    } catch (error) {
        await transaction.rollback();  // Undo all changes on error
        res.status(500).json({ success: false, message: error.message });
    }
};
```

---

## 🔧 Backend Architecture Deep Dive

### **1️⃣ Middleware Pipeline**

```javascript
/*
 * Express Middleware Order (server.js)
 * 
 * Order matters! Each layer processes the request and passes to next()
 */

// 1️⃣ Security Middleware
app.use(helmet({
    // Helmet: Sets security HTTP headers
    // - Prevents XSS, clickjacking, etc.
    // - CSP: Content Security Policy restricts source of scripts/styles
    // - HSTS: Forces HTTPS
}));

// 2️⃣ CORS Middleware
app.use(cors({
    origin: ALLOWED_ORIGINS,  // Only specific domains can call API
    credentials: true,        // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3️⃣ Body Parser Middleware
app.use(express.json({ limit: '10mb' }));  // Parse JSON bodies
app.use(express.urlencoded({ limit: '10mb', extended: true }));  // Parse form data

// 4️⃣ Input Sanitization Middleware
app.use(sanitizeInput);  // Remove malicious content from inputs

// 5️⃣ Rate Limiting Middleware
app.use('/api', apiLimiter);  // Limit requests per IP (prevent DDoS)

// 6️⃣ Request Logger Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// 7️⃣ Route Handlers
app.use('/api/auth', authRoutes);      // Authentication routes
app.use('/api/welfare', welfareRoutes); // Welfare request routes
// ... more routes ...

// 8️⃣ 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// 9️⃣ Error Handler (must be last)
app.use(errorHandler);  // Catches all errors from routes/middleware
```

### **2️⃣ Validation Middleware**

```javascript
// backend/middleware/validation.js
const { body, query, param, validationResult } = require('express-validator');

/*
 * Express-Validator Usage
 * 
 * Purpose: Sanitize and validate request data before it reaches controllers
 * Benefits:
 * - Prevents invalid data from entering database
 * - Consistent error responses
 * - Protects against injection attacks
 */

// ✅ Validation error handler (must be in middleware chain)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,        // Which field failed
                message: err.msg,         // Error message
                value: err.value          // What user sent
            }))
        });
    }
    next();  // All validations passed, continue
};

// ✅ Pagination validation (reusable)
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .withMessage('Page must be between 1 and 100000'),
    query('limit')
        .optional()
        .isInt({ min: 10, max: 500 })
        .withMessage('Limit must be between 10 and 500'),
    handleValidationErrors
];

// ✅ Welfare request validation
const validateWelfareRequest = [
    body('studentName')
        .trim()                           // Remove whitespace
        .notEmpty()
        .withMessage('Student name is required')
        .isLength({ min: 2, max: 100 }),
    body('grade')
        .trim()
        .notEmpty()
        .withMessage('Grade is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    handleValidationErrors
];

// ✅ Usage in routes:
router.post('/', validationRules.welfare(), validate, welfareController.create);
//                 ↑ Validation rules      ↑ Error handler  ↑ Handler
```

### **3️⃣ Error Handling**

```javascript
// backend/middleware/errorHandler.js

/*
 * ERROR HANDLING ARCHITECTURE
 * 
 * Problem: Errors can occur in async route handlers
 * Solution: Catch them and pass to centralized error handler
 * 
 * Pattern: try/catch in controller → throw Error → errorHandler catches it
 */

// ✅ Async Route Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);  // Catch async errors
};

// ✅ Centralized Error Handler
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('[ERROR]', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Determine HTTP status code
    const status = err.status || err.statusCode || 500;
    
    // Hide stack trace in production (security)
    const message = process.env.NODE_ENV === 'production'
        ? (status === 500 ? 'Internal server error' : err.message)
        : err.message;

    // Send error response
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && {
            stack: err.stack,           // Debug info
            details: err.details
        })
    });
};

// ✅ Usage in routes:
router.post('/welfare', asyncHandler(async (req, res) => {
    // If error occurs here, asyncHandler catches it
    const result = await WelfareRequest.create(req.body);
    res.json({ success: true, data: result });
}));
```

### **4️⃣ Authorization Middleware**

```javascript
// backend/middleware/authMiddleware.js

const authorize = (...roles) => {
    return (req, res, next) => {
        /*
         * Two-step authorization:
         * 1. User must be authenticated (req.user set by protect() middleware)
         * 2. User's role must be in allowed list
         */

        // ✅ Step 1: Check authenticated
        if (!req.user) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: User not authenticated" 
            });
        }

        // ✅ Step 2: Check role (case-insensitive)
        const userRole = req.user.role.trim().toUpperCase();
        const allowedRoles = roles.map(r => r.trim().toUpperCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Only ${allowedRoles.join(', ')} can access this`
            });
        }

        next();  // Authorization passed
    };
};

// ✅ Usage in routes:
router.patch(
    '/:id/verify',
    protect,              // Must be authenticated
    authorize('ZEO'),     // Must be ZEO
    validationRules.verifyDonation(),
    validate,
    donationController.verifyDonation
);
```

---

## 🗄️ Database Models (Complete Reference)

### **Model 1: User (Central Authentication)**

```javascript
const User = db.define('User', {
    id: PRIMARY KEY,
    fullName: STRING,
    email: STRING UNIQUE,
    passwordHash: STRING,
    role: ENUM['ZEO', 'PRINCIPAL', 'TEACHER', 'DONOR'],
    
    // Email verification workflow
    isVerified: BOOLEAN (default: false),
    isActive: BOOLEAN (default: true),
    activationToken: STRING (6-digit code),
    activationExpires: DATE (15 minutes),
    
    // Token management
    refreshToken: STRING (optional, for logout tracking)
});

// ✅ This is the root table that all role-specific tables reference
// ✅ Single user can only have ONE role
```

### **Model 2: WelfareRequest (Core Business Entity)**

```javascript
const WelfareRequest = db.define('WelfareRequest', {
    id: PRIMARY KEY,
    referenceCode: STRING UNIQUE,  // Unique identifier
    
    // Foreign Keys
    studentId: INTEGER,     // Which student needs help
    teacherId: INTEGER,     // Who submitted the request
    schoolId: INTEGER,      // Which school
    
    // Request Details
    category: ENUM[
        'Supplies', 'Fees', 'Medical', 'Transport', 
        'Equipment', 'Hostel', 'Food', 'Books', 'Uniforms', 'Other'
    ],
    description: TEXT,      // Why student needs help
    amountRequired: DECIMAL,  // How much needed
    priority: ENUM['LOW', 'MEDIUM', 'HIGH'],
    
    // State Machine Status
    status: ENUM[
        'SUBMITTED',
        'PRINCIPAL_APPROVED',
        'ZEO_APPROVED',
        'PUBLISHED',
        'PARTIALLY_FUNDED',
        'FULLY_FUNDED',
        'TRANSFERRED',
        'REJECTED'
    ],
    
    // ✅ Database Indexes for performance
    indexes: [
        ['status'],      // Fast filtering
        ['school_id'],   // School-specific queries
        ['teacher_id'],  // Teacher's requests
        ['student_id'],  // Student's requests
        ['created_at']   // Time-based filtering
    ]
});
```

### **Model 3: Donation (Funding)**

```javascript
const Donation = db.define('Donation', {
    id: PRIMARY KEY,
    
    // Foreign Keys
    donorId: INTEGER,             // Who donated
    welfareRequestId: INTEGER,    // To which request
    schoolId: INTEGER,            // Direct donation to school
    
    // Donation Details
    amount: DECIMAL,              // How much
    
    // Verification
    status: ENUM[
        'PENDING',
        'VERIFIED',
        'REJECTED',
        'PENDING_REVIEW'
    ] (default: 'PENDING'),
    
    verifiedBy: INTEGER,          // Which ZEO verified
    verifiedAt: DATE,             // When verified
    
    // ✅ Indexes
    indexes: [
        ['donor_id'],
        ['welfare_request_id'],
        ['status'],
        ['created_at']
    ]
});

// ✅ Donation Workflow:
// 1. Donor submits donation (status: PENDING)
// 2. ZEO reviews and verifies (status: VERIFIED or REJECTED)
// 3. If VERIFIED, helps fund the welfare request
```

### **Model 4: Transfer (Fund Movement)**

```javascript
const Transfer = db.define('Transfer', {
    id: PRIMARY KEY,
    
    // Foreign Keys
    welfareRequestId: INTEGER,    // Which request
    donationId: INTEGER,          // Which donation
    schoolId: INTEGER,            // Receiving school
    transferredBy: INTEGER,       // Who approved transfer (ZEO user ID)
    
    // Transfer Details
    amount: DECIMAL,              // Amount transferred
    referenceNumber: STRING,      // Unique transfer ID
    
    status: ENUM[
        'PENDING',
        'COMPLETED',
        'FAILED'
    ] (default: 'PENDING'),
    
    notes: TEXT,                  // Additional notes
    
    // Timestamps
    transferredAt: DATE           // When processed
});

// ✅ Transfer Workflow:
// 1. Welfare request FULLY_FUNDED
// 2. ZEO initiates transfer
// 3. Creates Transfer record linking donation to receiving school
// 4. Updates WelfareRequest status to TRANSFERRED (terminal)
```

### **Model 5: WelfareApproval (Audit Trail)**

```javascript
const WelfareApproval = db.define('WelfareApproval', {
    id: PRIMARY KEY,
    
    // Foreign Keys
    welfareRequestId: INTEGER,    // Which request
    approvedBy: INTEGER,          // Which user approved (ZEO, Principal, etc.)
    
    // Action Details
    status: STRING,               // Action taken (PRINCIPAL_APPROVED, ZEO_APPROVED, etc.)
    notes: TEXT,                  // Comments
    
    // ✅ Complete audit trail of every action on welfare request
});

// ✅ This creates a complete history:
// 1. Teacher submits → WelfareApproval created
// 2. Principal approves → WelfareApproval created
// 3. ZEO publishes → WelfareApproval created
// 4. Donation verified → WelfareApproval created
// ... every action is recorded
```

### **Model 6: Resource (Educational Material Sharing)**

```javascript
const Resource = db.define('Resource', {
    id: PRIMARY KEY,
    
    // Foreign Keys
    teacherId: INTEGER,           // Who created
    subjectId: INTEGER,           // Which subject
    schoolId: INTEGER,            // Which school
    
    // Resource Details
    title: STRING,
    description: TEXT,
    resourceType: ENUM['Document', 'Video', 'Image', 'Link'],
    url: STRING,                  // File URL or external link
    
    isPublic: BOOLEAN (default: false),  // Visible to others?
    
    // ✅ Indexes
    indexes: [
        ['teacher_id'],
        ['subject_id'],
        ['is_public']              // Fast filtering of public resources
    ]
});

// ✅ Resource Workflow:
// 1. Teacher uploads resource
// 2. Mark as public to share with other teachers
// 3. Other teachers can view and download
```

### **Model 7: Circular (Announcements)**

```javascript
const Circular = db.define('Circular', {
    id: PRIMARY KEY,
    
    // Foreign Key
    publishedBy: INTEGER,         // Which ZEO published
    
    // Content
    title: STRING,
    content: TEXT,
    attachments: JSON,            // Array of file URLs
    
    status: ENUM[
        'DRAFT',
        'PUBLISHED',
        'ARCHIVED'
    ],
    priority: ENUM['LOW', 'MEDIUM', 'HIGH'],
    
    // Recipients and tracking
    recipientIds: JSON,           // Array of user IDs who can see
    viewedCount: INTEGER,
    
    // Timestamps
    publishedAt: DATE
});

// ✅ Circular Workflow:
// 1. ZEO creates circular (DRAFT)
// 2. ZEO publishes (PUBLISHED)
// 3. Recipients can view
// 4. System tracks who viewed
```

---

## 🎨 Frontend Architecture

### **1️⃣ Authentication Context (State Management)**

```javascript
// frontend/src/context/AuthContext.jsx

/*
 * CONTEXT PATTERN: React's global state management
 * Without Context: Would need to pass auth data through many components (prop drilling)
 * With Context: Any component can access auth data
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // ✅ State Variables
    const [user, setUser] = useState(null);           // Logged-in user data
    const [role, setRole] = useState(null);           // User's role (teacher, principal, etc.)
    const [loading, setLoading] = useState(true);     // Loading state
    const [isRefreshing, setIsRefreshing] = useState(false);  // Token refresh in progress

    // ✅ Effect 1: Check for existing token on mount
    useEffect(() => {
        const token = getToken();
        if (token && isTokenValid()) {
            const userInfo = getUserInfo();            // Decode token
            const userRole = getUserRole();
            setUser(userInfo);
            setRole(userRole);
        }
        setLoading(false);
    }, []);

    // ✅ Effect 2: Proactive token refresh every 60 seconds
    useEffect(() => {
        const refreshInterval = setInterval(async () => {
            const token = getToken();
            const refreshToken = getRefreshToken();

            if (token && refreshToken && isTokenExpiring(token, 5)) {
                if (!isRefreshing) {
                    try {
                        setIsRefreshing(true);
                        const response = await client.post('/auth/refresh', { refreshToken });
                        if (response.data.token) {
                            saveToken(response.data.token);
                            if (response.data.refreshToken) {
                                saveRefreshToken(response.data.refreshToken);
                            }
                        }
                    } catch (err) {
                        handleLogout();  // Force logout on error
                    } finally {
                        setIsRefreshing(false);
                    }
                }
            }
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, [isRefreshing]);

    // ✅ Login function (called after user registers/logs in)
    const login = (loginResponse) => {
        const token = typeof loginResponse === 'string' 
            ? loginResponse 
            : loginResponse.token;
        
        if (token) saveToken(token);
        
        const userInfo = getUserInfo();
        const userRole = getUserRole();
        setUser(userInfo);
        setRole(userRole);
    };

    // ✅ Logout function (API call + cleanup)
    const handleLogout = async () => {
        try {
            await client.post('/auth/logout');  // Notify backend
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            removeToken();                      // Clear tokens
            setUser(null);
            setRole(null);
            setIsRefreshing(false);
            navigate('/login');                 // Redirect
        }
    };

    // ✅ Expose context value
    const value = {
        user,
        role,
        loading,
        login,
        logout: handleLogout,
        isAuthenticated: !!user && !!role,
        isRefreshing
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Hook for using auth context anywhere
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

### **2️⃣ API Client with Token Management**

```javascript
// frontend/src/services/apiClient.js

import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, isTokenExpiring } from '../utils/tokenHelper';

/*
 * AXIOS INSTANCE: Reusable HTTP client for all API calls
 * 
 * Features:
 * 1. Automatic token injection (Authorization header)
 * 2. Proactive token refresh
 * 3. Automatic retry on 401 (token expired)
 * 4. Queue management for concurrent requests
 */

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Queue for failed requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ✅ REQUEST INTERCEPTOR: Add token to every request + proactive refresh
client.interceptors.request.use(
    async (config) => {
        let token = getToken();
        const refreshToken = getRefreshToken();

        // Proactive refresh if token expiring soon
        if (token && isTokenExpiring(token, 5)) {
            if (refreshToken && !isRefreshing) {
                try {
                    isRefreshing = true;
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh`,
                        { refreshToken }
                    );
                    
                    if (data.token) {
                        setToken(data.token);
                        token = data.token;
                    }
                } catch (err) {
                    console.error('Proactive refresh failed:', err);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Attach token to request
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    error => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR: Handle 401 errors + auto-retry
client.interceptors.response.use(
    response => response,  // Success: return response
    async error => {
        const originalRequest = error.config;
        
        // Check if this is a 401 error (unauthorized/token expired)
        if (
            error.response?.status === 401 &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // Token refresh in progress, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return client(originalRequest);  // Retry original request
                });
            } else {
                // Start token refresh
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = getRefreshToken();
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh`,
                        { refreshToken }
                    );

                    if (data.token) {
                        setToken(data.token);
                        processQueue(null, data.token);  // Resolve queued requests
                        originalRequest.headers.Authorization = `Bearer ${data.token}`;
                        return client(originalRequest);  // Retry original request
                    }
                } catch (err) {
                    processQueue(err, null);  // Reject queued requests
                    removeToken();
                    window.location.href = '/login';  // Force login
                } finally {
                    isRefreshing = false;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default client;
```

### **3️⃣ Token Helper Utilities**

```javascript
// frontend/src/utils/tokenHelper.js

import { jwtDecode } from 'jwt-decode';

/*
 * TOKEN MANAGEMENT UTILITIES
 * Purpose: Consistently handle token storage and validation
 * Storage: localStorage (persists across page refreshes)
 */

// ✅ Get access token from storage
export const getToken = () => {
    return localStorage.getItem('token');
};

// ✅ Save access token to storage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// ✅ Get refresh token from storage
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// ✅ Save refresh token to storage
export const setRefreshToken = (token) => {
    localStorage.setItem('refreshToken', token);
};

// ✅ Clear both tokens (logout)
export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

// ✅ Decode JWT (parse claims without verification)
export const decodeToken = (token) => {
    try {
        return jwtDecode(token);  // Parse JWT payload
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// ✅ Get user role from token
export const getUserRole = () => {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.role?.toLowerCase() || null;
};

// ✅ Get user info from token claims
export const getUserInfo = () => {
    const token = getToken();
    if (!token) return null;

    return decodeToken(token);  // Returns { id, role, type, iat, exp }
};

// ✅ Check if token is still valid
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    // Compare current time with token expiration time
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
};

// ✅ Check if token will expire soon
export const isTokenExpiring = (token, minutesBuffer = 5) => {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    const bufferSeconds = minutesBuffer * 60;
    const expirationThreshold = decoded.exp - bufferSeconds;

    // Return true if we're past the threshold
    return currentTime > expirationThreshold;
};
```

---

## 📱 Frontend Component Architecture

### **1️⃣ Router Setup (Routing & Protection)**

```javascript
// frontend/src/routes/AppRouter.jsx

/*
 * ROUTING ARCHITECTURE
 * 
 * Problem: Need to protect certain routes (only logged-in users)
 * Solution: ProtectedRoute component that checks authentication
 */

export const AppRouter = () => {
    const { isAuthenticated, loading, role } = useAuth();

    if (loading) return <LoadingSpinner />;  // Show while verifying token

    return (
        <BrowserRouter>
            <Routes>
                {/* ✅ Public Routes (anyone can access) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<DonorRegistration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify" element={<ActivateAccount />} />
                <Route path="/public-resources" element={<PublicResources />} />

                {/* ✅ Protected Routes (require authentication + specific roles) */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} role={role} />}>
                    
                    {/* Teacher Routes */}
                    {role === 'teacher' && (
                        <Route path="/teacher/*" element={<TeacherDashboard />} />
                    )}

                    {/* Principal Routes */}
                    {role === 'principal' && (
                        <Route path="/principal/*" element={<PrincipalDashboard />} />
                    )}

                    {/* ZEO Routes */}
                    {role === 'zeo' && (
                        <Route path="/zeo/*" element={<ZEODashboard />} />
                    )}

                    {/* Donor Routes */}
                    {role === 'donor' && (
                        <Route path="/donor/*" element={<DonorDashboard />} />
                    )}
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};
```

### **2️⃣ Protected Route Component**

```javascript
// frontend/src/routes/ProtectedRoute.jsx

/*
 * PROTECTED ROUTE GUARD
 * 
 * Purpose: Prevent unauthorized access to protected pages
 * Logic: If not authenticated, redirect to login
 */

export const ProtectedRoute = ({ isAuthenticated, role }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });  // Redirect to login
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <LoadingSpinner />;  // Show while redirecting
    }

    return <Outlet />;  // Render the protected page
};
```

### **3️⃣ Dashboard Components**

```javascript
// frontend/src/layouts/DashboardLayout.jsx

/*
 * DASHBOARD LAYOUT
 * Shared layout for all role-based dashboards
 * Includes: Sidebar navigation, header, main content area
 */

export const DashboardLayout = ({ children, userRole }) => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ✅ Navigation items based on role
    const navItems = {
        teacher: [
            { label: 'My Requests', path: '/teacher/welfare' },
            { label: 'My Resources', path: '/teacher/resources' },
            { label: 'Students', path: '/teacher/students' },
            { label: 'Profile', path: '/teacher/profile' }
        ],
        principal: [
            { label: 'Requests', path: '/principal/welfare' },
            { label: 'School', path: '/principal/school' },
            { label: 'Teachers', path: '/principal/teachers' },
            { label: 'Reports', path: '/principal/reports' }
        ],
        zeo: [
            { label: 'Dashboard', path: '/zeo/dashboard' },
            { label: 'Requests', path: '/zeo/welfare' },
            { label: 'Donations', path: '/zeo/donations' },
            { label: 'Transfers', path: '/zeo/transfers' },
            { label: 'Schools', path: '/zeo/schools' },
            { label: 'Reports', path: '/zeo/reports' }
        ],
        donor: [
            { label: 'Dashboard', path: '/donor/dashboard' },
            { label: 'Requests', path: '/donor/requests' },
            { label: 'My Donations', path: '/donor/donations' },
            { label: 'Profile', path: '/donor/profile' }
        ]
    };

    return (
        <div className="flex h-screen">
            {/* ✅ Sidebar */}
            <aside className="w-64 bg-blue-600 text-white p-4">
                <h1 className="text-2xl font-bold mb-8">EduZone</h1>
                
                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems[userRole]?.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="block p-3 rounded hover:bg-blue-700"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="mt-auto w-full p-3 bg-red-600 rounded"
                >
                    Logout
                </button>
            </aside>

            {/* ✅ Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-gray-100 p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Welcome, {user?.fullName}</h2>
                        <span className="text-sm text-gray-600">{user?.role}</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};
```

---

## 🎯 Request/Response Flow Examples

### **Example 1: Teacher Submits Welfare Request**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Teacher fills form and clicks "Submit"                  │
└─────────────────────────────────────────────────────────────────┘

Form Data:
{
    "studentName": "Ahmed Ali",
    "grade": "8",
    "section": "A",
    "description": "Needs school supplies and stationary",
    "category": "Supplies",
    "amountRequired": 5000,
    "priority": "HIGH"
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend validates and calls API                        │
└─────────────────────────────────────────────────────────────────┘

POST /api/welfare
Authorization: Bearer <accessToken>
Content-Type: application/json
{
    "studentName": "Ahmed Ali",
    ...
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend middleware processes request                    │
└─────────────────────────────────────────────────────────────────┘

1. Rate limiter checks: IP has < 60 requests/min ✅
2. CORS validates: Frontend origin allowed ✅
3. Authentication (protect middleware):
   - Extract token from Authorization header
   - Verify with ACCESS_TOKEN_SECRET
   - Check token.type === 'access'
   - Load User from database
   - Attach to req.user ✅
4. Validation rules:
   - studentName: not empty, 2-100 chars ✅
   - grade: valid format ✅
   - amountRequired: > 0 ✅
5. Sanitization: Remove any malicious content ✅

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Controller processes business logic                     │
└─────────────────────────────────────────────────────────────────┘

welfareController.createRequest():

1. Start transaction
2. Find teacher profile using req.user.id
   - Query: SELECT * FROM teachers WHERE userId = ?
3. Find school from teacher.schoolId
4. Check if student exists in school
   - Query: SELECT * FROM students WHERE fullName=? AND schoolId=?
5. If not exists, create student record
6. Create WelfareRequest record:
   - Status = 'SUBMITTED' (initial state)
   - Generate referenceCode = 'WR-20250416-001'
7. Create WelfareApproval (audit trail)
   - Record that Teacher created this request
8. Commit transaction (all-or-nothing)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Backend sends response                                  │
└─────────────────────────────────────────────────────────────────┘

HTTP 201 Created
{
    "success": true,
    "message": "Welfare request created successfully",
    "data": {
        "id": 42,
        "referenceCode": "WR-20250416-001",
        "studentName": "Ahmed Ali",
        "status": "SUBMITTED",
        "amountRequired": 5000,
        "createdAt": "2025-04-16T10:30:00Z"
    }
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Frontend updates UI and shows confirmation              │
└─────────────────────────────────────────────────────────────────┘

- Display success toast: "Request submitted successfully!"
- Navigate to /teacher/welfare
- Show request in list with status "SUBMITTED"
- Teacher can now wait for principal approval
```

---

### **Example 2: Donation Verification by ZEO**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: ZEO views pending donations                             │
└─────────────────────────────────────────────────────────────────┘

Fetch /api/donations?status=PENDING&limit=50

Response:
{
    "data": [
        {
            "id": 15,
            "donorName": "Ali Enterprise",
            "amount": 2500,
            "status": "PENDING",
            "welfareRequest": "WR-20250416-001",
            "createdAt": "2025-04-16T09:15:00Z"
        },
        ...
    ]
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: ZEO clicks "Verify" and selects status                  │
└─────────────────────────────────────────────────────────────────┘

ZEO chooses: "VERIFIED"
Clicks Submit

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend calls verify endpoint                          │
└─────────────────────────────────────────────────────────────────┘

PATCH /api/donations/15/verify
Authorization: Bearer <zeoAccessToken>
{
    "status": "VERIFIED"
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend verifies authorization                          │
└─────────────────────────────────────────────────────────────────┘

1. Authentication (protect):
   - Verify ZEO's token ✅
2. Authorization (authorize('ZEO')):
   - Check req.user.role === 'ZEO' ✅
3. Validation:
   - status must be VERIFIED, REJECTED, or PENDING_REVIEW ✅

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Process donation verification                           │
└─────────────────────────────────────────────────────────────────┘

1. Start transaction
2. Find donation by ID
3. Update donation:
   - status = 'VERIFIED'
   - verifiedBy = req.user.id (ZEO's ID)
   - verifiedAt = NOW()
4. Create WelfareApproval (audit trail):
   - Record: "Donation #15 verified by ZEO-004"
5. Send notification to donor:
   - "Your donation has been verified!"
6. Calculate total funding:
   - Query all VERIFIED donations for this welfare request
   - Sum = 2500 + 3000 + 1500 = 7000
7. Check if fully funded:
   - Needed: 5000
   - Received: 7000 (>= 5000)
   - Update WelfareRequest.status = 'FULLY_FUNDED'
8. Commit transaction

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Return response                                         │
└─────────────────────────────────────────────────────────────────┘

HTTP 200 OK
{
    "success": true,
    "message": "Donation verified as VERIFIED",
    "donation": {
        "id": 15,
        "amount": 2500,
        "status": "VERIFIED",
        "verifiedAt": "2025-04-16T10:45:00Z"
    }
}

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend updates UI                                     │
└─────────────────────────────────────────────────────────────────┘

- Show success message
- Update donation status to VERIFIED
- If welfare request is now FULLY_FUNDED:
  - Show notification: "Request fully funded!"
  - Enable "Transfer Funds" button
```

---

## 🔒 Security Implementation

### **Security Layers**

```javascript
/*
 * DEFENSE-IN-DEPTH SECURITY STRATEGY
 * Multiple layers to catch issues at different levels
 */

// ✅ Layer 1: HTTPS (Transport Security)
// - All traffic encrypted in transit
// - Prevents man-in-the-middle attacks
// - HSTS header forces HTTPS

// ✅ Layer 2: Input Validation (Request Validation)
const validateInput = [
    body('email').isEmail(),          // Reject non-emails
    body('password').isLength({ min: 8 }),  // Enforce minimum length
    body('amount').isNumeric(),       // Reject non-numbers
    // Prevents SQL injection, XSS, NoSQL injection

    // Sanitization
    body('name').trim().escape(),     // Remove whitespace & escape HTML
    // Converts: "<script>alert('xss')</script>" → "&lt;script&gt;..."
];

// ✅ Layer 3: Authentication (verify who are you)
const protect = asyncHandler((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// ✅ Layer 4: Authorization (verify what you can do)
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// ✅ Layer 5: Database Transactions (atomicity)
const transaction = await sequelize.transaction();
try {
    // All changes grouped: success or fail together
    await Model1.update(data1, { transaction });
    await Model2.update(data2, { transaction });
    await transaction.commit();  // All applied
} catch (err) {
    await transaction.rollback();  // All reverted
}

// ✅ Layer 6: Rate Limiting (prevent abuse)
const rateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                    // Max 100 requests per window
    // Prevents brute-force, DDoS
});

// ✅ Layer 7: CORS (prevent cross-site attacks)
app.use(cors({
    origin: ['https://example.com'],  // Only allow specific domains
    credentials: true,
    methods: ['GET', 'POST']
}));

// ✅ Layer 8: Helmet (security headers)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],          // Only load from own domain
            scriptSrc: ["'self'"],           // Only own scripts
            imgSrc: ["'self'", "data:"]      // Only own or data URLs
        }
    }
}));

// ✅ Layer 9: JWT Token Expiration
// Access tokens expire in 15 minutes (limited damage if stolen)
// Refresh tokens expire in 7 days (requires user to re-login eventually)

// ✅ Layer 10: Password Hashing
const hashedPassword = await bcrypt.hash(password, 10);
// Bcrypt uses password salting + multiple iterations
// Makes rainbow table attacks impractical
```

---

## 🧪 Testing Strategy

### **Backend Testing with Jest**

```javascript
// backend/tests/api/auth.test.js

describe('Authentication', () => {
    
    // ✅ Test 1: Donor Registration
    test('POST /api/auth/donor/register - Should create new donor', async () => {
        const response = await request(app)
            .post('/api/auth/donor/register')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                phone: '0300-1234567',
                organizationName: 'Charity Org'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Token sent to email');
    });

    // ✅ Test 2: Email Verification
    test('POST /api/auth/verify - Should verify and return tokens', async () => {
        // First register
        await User.create({
            fullName: 'Test User',
            email: 'test@example.com',
            passwordHash: await bcrypt.hash('Password123!', 10),
            activationToken: '123456',
            activationExpires: new Date(Date.now() + 15 * 60 * 1000)
        });

        const response = await request(app)
            .post('/api/auth/verify')
            .send({
                email: 'test@example.com',
                verificationCode: '123456'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
    });

    // ✅ Test 3: Login
    test('POST /api/auth/login - Should return tokens', async () => {
        // Create user
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        await User.create({
            fullName: 'Test User',
            email: 'test@example.com',
            passwordHash: hashedPassword,
            isVerified: true
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'Password123!'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    // ✅ Test 4: Protected Route Access
    test('GET /api/schools - Should reject without token', async () => {
        const response = await request(app)
            .get('/api/schools');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    // ✅ Test 5: Authorization Check
    test('PATCH /api/donations/1/verify - Should reject if not ZEO', async () => {
        const teacherToken = jwt.sign(
            { id: 1, role: 'TEACHER', type: 'access' },
            process.env.JWT_ACCESS_SECRET
        );

        const response = await request(app)
            .patch('/api/donations/1/verify')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ status: 'VERIFIED' });

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Forbidden');
    });
});

// ✅ Running tests:
// npm test --- Runs all tests
// npm test -- --coverage --- Shows code coverage
// npm test -- --watch --- Re-run on file changes
```

---

## 📈 Performance Optimizations

### **Database Indexes**

```javascript
/*
 * INDEXES: Speed up database queries
 * 
 * Without index on "status":
 * SELECT * FROM welfare_requests WHERE status='PUBLISHED'
 * → Scans all 10,000 rows (slow!)
 * 
 * With index on "status":
 * → Finds matching rows in ~100ms (fast!)
 */

const WelfareRequest = db.define('WelfareRequest', {
    // ... fields ...
}, {
    indexes: [
        { fields: ['status'] },        // Fast filtering by status
        { fields: ['school_id'] },     // Fast filtering by school
        { fields: ['teacher_id'] },    // Fast filtering by teacher
        { fields: ['student_id'] },    // Fast filtering by student
        { fields: ['created_at'] }     // Fast sorting by date
    ]
});

// ✅ Similar indexes on other frequently queried models:
// - User: email (unique), role, is_verified
// - Donation: donor_id, welfare_request_id, status, created_at
// - Teacher: school_id, user_id
```

---

## 🚀 Deployment Checklist

```javascript
/*
 * PRE-DEPLOYMENT VERIFICATION
 */

✅ Environment Configuration
   - JWT_ACCESS_SECRET set
   - JWT_REFRESH_SECRET set
   - Database credentials configured
   - Email service credentials set
   - ALLOWED_ORIGINS configured
   - NODE_ENV = 'production'

✅ Security
   - HTTPS enabled
   - CORS restricted to specific origins
   - Rate limiting enabled
   - CSRF protection configured
   - Password requirements enforced
   - No console.log statements in critical paths

✅ Database
   - Migrations run
   - Indexes created
   - Backups configured
   - Connection pooling configured

✅ Testing
   - 95%+ test pass rate
   - No console errors
   - Frontend builds successfully
   - Error handling comprehensive

✅ Monitoring
   - Logging configured (logs all errors)
   - Error tracking setup (Sentry)
   - Performance monitoring (NewRelic)
   - Uptime monitoring configured

✅ Documentation
   - API documentation complete
   - Environment variables documented
   - Deployment procedure documented
   - Emergency procedures documented
```

---

## 📚 Key Concepts Summary

| Concept | What | Why |
|----|----|----|
| **JWT Tokens** | JSON Web Tokens encode user info | Stateless auth, scalable |
| **Dual-Token System** | Access + Refresh | Security (short-lived access, long-lived refresh) |
| **Middleware** | Intercept & process requests | Reusable, enforces rules consistently |
| **Validation** | Check input data format | Prevent invalid data in database |
| **State Machine** | Strict workflow rules | Prevent invalid state transitions |
| **Transactions** | All-or-nothing database changes | Data consistency |
| **Interceptors** | Intercept API requests/responses | Attach tokens, auto-retry |
| **Context API** | Global React state | Share auth data without prop drilling |
| **Protectedroute** | Middleware for routes | Require authentication for certain pages |

---

## 🎓 For New Developers

### **Getting Started**

1. **Understand the Architecture**
   - Read this document top-to-bottom
   - Map out models and their relationships
   - Trace a user registration flow

2. **Set Up Environment**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in JWT secrets and DB credentials
   npm test  # Verify everything works
   ```

3. **Read Key Files in Order**
   1. `models/index.js` (understand relationships)
   2. `middleware/authMiddleware.js` (understand auth)
   3. `controllers/authController.js` (understand business logic)
   4. `routes/authRoutes.js` (understand API structure)
   5. `frontend/src/context/AuthContext.jsx` (understand frontend state)

4. **Make a Small Change**
   - Add a validation rule
   - Add a new field to a model
   - Small PR to get feedback

5. **Ask Questions**
   - Comment on confusing code
   - Update this documentation
   - Help next developer

---

## 🐛 Debugging Tips

```javascript
// 1️⃣ Authentication Issues
// Check: req.user exists
// Check: Token verifies with correct secret
// Check: Token hasn't expired
console.log('[AUTH]', { user: req.user, token: req.headers.authorization });

// 2️⃣ Database Issues
// Check: Connection string correct
// Check: Table exists
// Check: Indexes working
// Enable SQL logging: sequelize.options.logging = console.log;

// 3️⃣ Frontend Issues
// Check: Token stored in localStorage
// Check: API endpoint correct
// Check: Headers sent correctly
// Use browser DevTools → Network tab to inspect requests

// 4️⃣ Email Issues
// Check: Gmail credentials correct
// Check: 2FA not blocking
// Check: Email templates correct

// 5️⃣ Permission Issues
// Check: User role stored correctly
// Check: authorize() middleware added to route
// Check: Role compared correctly (case-sensitive!)
```

---

**Document Version:** 1.0  
**Last Updated:** April 16, 2025  
**Status:** ✅ Complete Code Review
