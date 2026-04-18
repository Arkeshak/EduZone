# 🎓 EduZone - Developer Learning Guide

## For New Developers: Core Concepts & Patterns

This guide explains **patterns and concepts** used throughout EduZone so you can understand the "why" behind the code.

---

## 1️⃣ Authentication Pattern

### The Problem
- Users need to login
- We need to verify who they are
- We need to remember them across requests
- We need to prevent account takeover

### The Solution: JWT Tokens

```javascript
// Step 1: User logs in with email + password
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123!"
}

// Step 2: Backend verifies password and returns tokens
Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",      // Access token
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Refresh token
}

// Step 3: Frontend stores tokens in localStorage
localStorage.setItem('token', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Step 4: Frontend attaches token to every request
GET /api/schools
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Step 5: Backend verifies token before allowing access
authMiddleware.protect() → verifies token exists and is valid
authMiddleware.authorize('TEACHER') → checks if user is teacher

// Step 6: User can access protected resources
```

### Why Two Tokens?

```javascript
/*
 * ACCESS TOKEN (short-lived, 15 minutes)
 * - Used for API requests
 * - Expires quickly (limited damage if stolen)
 * - Sent with every request
 */

/*
 * REFRESH TOKEN (long-lived, 7 days)
 * - Only used to get new access tokens
 * - Longer expiration (convenience)
 * - Only sent to /auth/refresh endpoint
 * - More secure because it's not in every request
 */

// Frontend logic:
if (accessToken.expiresIn(5 minutes)) {
  // Get new access token using refresh token
  POST /api/auth/refresh
  {
    "refreshToken": refreshTokenValue
  }
  // Response has new access token
}
```

---

## 2️⃣ Middleware Pattern

### The Problem
- Every route needs to check if user is logged in
- Every route needs to validate input
- Errors should be handled consistently
- Code would be repetitive if each route did this itself

### The Solution: Middleware Chain

```javascript
// Express processes requests through a chain:

app.use(corsMiddleware);           // ← Process 1: Allow cross-origin
app.use(authMiddleware.protect);   // ← Process 2: Verify token exists
app.use(validate);                 // ← Process 3: Validate input
app.post('/api/welfare', handler);  // ← Process 4: Handle request

// If any middleware fails, rest of chain doesn't run
// Middleware must call next() to continue

Example flow for invalid input:
1. Request arrives
2. corsMiddleware checks origin ✅ OK
3. protect() checks token ✅ Token valid
4. validate() checks data ❌ Name too short!
5. validate() sends 400 error, CHAIN STOPS
6. Handler never runs
```

### Building a Middleware Chain

```javascript
// Pattern used throughout EduZone:

router.post(
  '/api/welfare',
  
  validationRules.welfare(),    // ← Validation rules
  validate,                      // ← Error handler
  protect,                       // ← Check token
  authorize('TEACHER'),          // ← Check role
  
  asyncHandler(                  // ← Error handler for async
    welfareController.createRequest  // ← The actual handler
  )
);

// If request passes all middleware, handler is called
// If any middleware fails, it sends error response
```

---

## 3️⃣ Validation Pattern

### The Problem
- Users submit invalid data
- Database gets corrupted with bad data
- App crashes on bad inputs
- Can't trust user input

### The Solution: Validate Early

```javascript
// Validation happens BEFORE database access
// Using express-validator:

const validateWelfareRequest = [
  body('studentName')              // ← Check 'studentName' field
    .trim()                        // Remove whitespace
    .notEmpty()                    // Can't be blank
    .withMessage('Student name is required')
    .isLength({ min: 2, max: 100 })  // Between 2-100 chars
    .withMessage('Name must be 2-100 characters'),
  
  body('amount')
    .isFloat({ min: 100 })         // Must be number, >= 100
    .withMessage('Amount must be at least 100'),
  
  handleValidationErrors           // ← Send errors if any failed
];

// If ALL validations pass: handleValidationErrors calls next()
// If ANY validation fails: handleValidationErrors sends 400 error
```

---

## 4️⃣ State Machine Pattern

### The Problem
- Welfare request has lifecycle: submitted → approved → published → funded
- Can't jump between states randomly
- Need to enforce valid transitions
- Status history important for audit

### The Solution: State Machine

```javascript
// Define ONLY valid transitions:

const VALID_TRANSITIONS = {
  'SUBMITTED': ['PRINCIPAL_APPROVED', 'REJECTED'],
  'PRINCIPAL_APPROVED': ['ZEO_APPROVED', 'REJECTED'],
  'ZEO_APPROVED': ['PUBLISHED', 'REJECTED'],
  'PUBLISHED': ['PARTIALLY_FUNDED', 'FULLY_FUNDED', 'REJECTED'],
  'PARTIALLY_FUNDED': ['FULLY_FUNDED', 'REJECTED'],
  'FULLY_FUNDED': ['TRANSFERRED', 'REJECTED'],
  'TRANSFERRED': [],  // Terminal: no more transitions
  'REJECTED': []      // Terminal: no more transitions
};

// When someone tries to update status:
const validateStatusTransition = (currentStatus, newStatus, userRole) => {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  
  if (!allowedTransitions.includes(newStatus)) {
    // ❌ INVALID: Can't go from SUBMITTED to TRANSFERRED
    return { valid: false, error: 'Invalid transition' };
  }
  
  // Role checks: Only principals can approve at certain stage
  if (userRole === 'PRINCIPAL' && !['PRINCIPAL_APPROVED'].includes(newStatus)) {
    return { valid: false, error: 'Only principals can approve' };
  }
  
  return { valid: true };  // ✅ Valid transition
};
```

---

## 5️⃣ Database Transaction Pattern

### The Problem
- Welfare request creation needs multiple database changes:
  1. Create student (if not exists)
  2. Create welfare request
  3. Create audit trail
- If step 2 fails, step 1 was wasted
- Database could end up in inconsistent state

### The Solution: Transactions

```javascript
// All-or-nothing database changes:

const transaction = await sequelize.transaction();

try {
  // Step 1: Create student (within transaction)
  const student = await Student.create({...}, { transaction });
  
  // Step 2: Create welfare request (within transaction)
  const request = await WelfareRequest.create({...}, { transaction });
  
  // Step 3: Create audit entry (within transaction)
  await WelfareApproval.create({...}, { transaction });
  
  // All succeeded! Commit all changes to database
  await transaction.commit();
  
  res.json({ success: true, data: request });
  
} catch (error) {
  // Any error: ROLLBACK everything
  await transaction.rollback();
  
  res.status(500).json({ success: false, message: error.message });
}

// Result: Either ALL changes applied, or NONE applied
// Database never in inconsistent state
```

---

## 6️⃣ React Hook Pattern (Frontend)

### The Problem
- Multiple components need auth data
- If each passed props, would need many levels of prop drilling
- Component hierarchy would be messy
- Hard to maintain

### The Solution: React Context + Hook

```javascript
// 1. Create context:
const AuthContext = createContext(null);

// 2. Create provider component (wraps entire app):
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  
  const value = { user, role, login, logout };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create custom hook (for convenient access):
export const useAuth = () => {
  return useContext(AuthContext);
};

// 4. Usage in any component:
function MyComponent() {
  const { user, role, logout } = useAuth();  // ← Easy access!
  
  return (
    <div>
      <p>Hello {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Benefits:
// - No prop drilling
// - Easy to share data
// - Component can access anywhere
// - Usually wraps entire app
```

---

## 7️⃣ API Interceptor Pattern (Frontend)

### The Problem
- Every API call needs token attached
- If token expired, need to refresh it
- Too much code to repeat in every component
- Need consistent error handling

### The Solution: Axios Interceptors

```javascript
// Create axios instance:
const client = axios.create({ baseURL: 'http://localhost:5000/api' });

// 1. REQUEST INTERCEPTOR (before sending)
client.interceptors.request.use(async (config) => {
  const token = getToken();
  
  // Attach token to Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Bonus: Proactive token refresh
  if (isTokenExpiring(token, 5)) {  // Expires within 5 min
    const newToken = await refreshToken();
    config.headers.Authorization = `Bearer ${newToken}`;
  }
  
  return config;  // Send request with token
});

// 2. RESPONSE INTERCEPTOR (after receiving)
client.interceptors.response.use(
  (response) => response,  // Success: return as-is
  async (error) => {
    if (error.response?.status === 401) {  // Token expired
      // Refresh token and retry original request
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return client(error.config);  // Retry with new token
    }
    return Promise.reject(error);
  }
);

// 3. Usage everywhere:
const response = await client.get('/schools');  // ← Token automatically attached!
```

---

## 8️⃣ Error Handling Pattern

### The Problem
- Errors can happen anywhere (database, validation, network)
- Each error handled differently
- Need consistent error responses
- Stack traces shouldn't leak to production

### The Solution: Centralized Error Handler

```javascript
// 1. Controllers throw consistent errors:
if (!student) {
  const error = new Error('Student not found');
  error.status = 404;
  throw error;
}

// 2. asyncHandler catches all errors:
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);  // ← Pass to error handler
};

// 3. Centralized error handler formats response:
app.use((err, req, res, next) => {
  const status = err.status || 500;
  
  // Hide stack trace in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  res.status(status).json({
    success: false,
    message
  });
});

// Result: Consistent, secure error responses everywhere
```

---

## 9️⃣ Component Composition Pattern

### Example: Teacher Submitting Welfare Request

```javascript
// Component hierarchy:
App
  ├─ AuthProvider
  │  └─ AppRouter
  │     └─ ProtectedRoute
  │        └─ TeacherDashboard
  │           └─ SubmitWelfare (your component)
  │              ├─ Form component
  │              │  └─ Input fields
  │              └─ FileUploader component

// Data flow:
1. useAuth() → Get token from AuthContext
2. Collect form data
3. Validate locally (pre-check)
4. Send to API: client.post('/api/welfare', formData)
5. Interceptor attaches token
6. Backend validates again
7. If valid: Create in database
8. Response has ID + reference code
9. Show confirmation toast
10. Navigate to my welfare requests
11. useEffect fetches list
12. Display with status badge
```

---

## 🔟 ORM (Sequelize) Pattern

### The Problem
- SQL queries are error-prone
- Hard to represent relationships
- Model changes require SQL migrations
- Need type safety

### The Solution: Sequelize ORM

```javascript
// 1. Define model (abstract, no SQL):
const Teacher = db.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  schoolId: { type: DataTypes.INTEGER, allowNull: false },
  // ... more fields
});

// 2. Define relationships:
User.hasOne(Teacher, { foreignKey: 'userId' });
Teacher.belongsTo(User, { foreignKey: 'userId' });
School.hasMany(Teacher, { foreignKey: 'schoolId' });
Teacher.belongsTo(School, { foreignKey: 'schoolId' });

// 3. Query using ORM (no SQL string!):
// ❌ Bad (raw SQL):
const teacher = await db.query(
  'SELECT * FROM teachers WHERE user_id = ?',
  [userId]
);

// ✅ Good (ORM):
const teacher = await Teacher.findOne({
  where: { userId: userId }
});

// 4. Access related data:
const school = await teacher.getSchool();  // Uses FK relationship
const user = await teacher.getUser();

// 5. Complex queries:
const school = await School.findOne({
  where: { id: schoolId },
  include: [
    {
      model: Teacher,
      include: [User]  // Get teachers and their user data
    },
    {
      model: Student
      // Get teachers and students
    }
  ]
});

// Benefits:
// - No SQL injection
// - Type safety
// - Relationships obvious
// - Fewer bugs
```

---

## 1️⃣1️⃣ Rate Limiting Pattern

### The Problem
- Malicious user could hammer API with thousands of requests
- Attacker could try to brute-force passwords
- Server could crash from overload
- Need to protect against DoS (Denial of Service)

### The Solution: Rate Limiting

```javascript
// Setup rate limiter:
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 100,                   // Max 100 requests per window
  standardHeaders: true,      // Return rate limit info
  legacyHeaders: false,
  skip: (req) => !isProduction  // Disable in development
});

app.use('/api', limiter);  // Apply to all /api routes

// What happens:
// - User 1st request: ✅ OK (1/100)
// - User 2nd request: ✅ OK (2/100)
// - User 100th request: ✅ OK (100/100)
// - User 101st request: ❌ BLOCKED
//   Response 429: "Too many requests, try again later"
//   Must wait 15 minutes before trying again

// Result: Protection from bot attacks
```

---

## 1️⃣2️⃣ Input Sanitization Pattern

### The Problem
- User could submit: `<script>alert('hacked')</script>`
- Script could steal tokens
- Database could be corrupted

### The Solution: Sanitization

```javascript
// Middleware cleans input:
const sanitizeInput = (req, res, next) => {
  // Take all input
  const sanitize = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/[<>]/g, '')           // Remove < >
        .trim();
    }
    return value;
  };
  
  // Apply to all fields
  req.body = Object.keys(req.body).reduce((acc, key) => {
    acc[key] = sanitize(req.body[key]);
    return acc;
  }, {});
  
  next();
};

// Example:
Input: { name: "<script alert('xss')</script>" }
After sanitization: { name: "script alert('xss')/script" }
// Script tags removed, can't execute
```

---

## 1️⃣3️⃣ Database Indexing Pattern

### The Problem
```javascript
// Without index:
SELECT * FROM welfare_requests WHERE status = 'PUBLISHED'
// Scans ALL 100,000 rows looking for status = 'PUBLISHED'
// Takes seconds! ❌ SLOW

// With index:
SELECT * FROM welfare_requests WHERE status = 'PUBLISHED'
// Database looks at index
// Finds 500 rows with status = 'PUBLISHED'
// Takes milliseconds! ✅ FAST
```

### The Solution: Add Indexes

```javascript
const WelfareRequest = db.define('WelfareRequest', {
  // ... fields ...
}, {
  indexes: [
    { fields: ['status'] },        // Index on status (fast filtering)
    { fields: ['school_id'] },     // Index on school_id
    { fields: ['teacher_id'] },    // Index on teacher_id
    { fields: ['created_at'] }     // Index on date (fast sorting)
  ]
});

// Now queries filter quickly without scanning all rows
```

---

## 1️⃣4️⃣ Testing Pattern

### The Problem
- How to verify code works?
- Manual testing takes time
- Easy to break things with changes
- Need confidence before deployment

### The Solution: Automated Tests

```javascript
// Jest test example:
describe('Welfare Controller', () => {
  
  test('POST /welfare creates request', async () => {
    // 1. Setup test data
    const user = await User.create({ email: 'test@example.com', ... });
    const teacher = await Teacher.create({ userId: user.id, ... });
    
    // 2. Make API call
    const response = await request(app)
      .post('/api/welfare')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentName: 'Ahmed', ... });
    
    // 3. Verify response
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    // 4. Verify database
    const request = await WelfareRequest.findOne({
      where: { id: response.body.data.id }
    });
    expect(request.studentName).toBe('Ahmed');
  });
});

// Run: npm test
// Result: ✅ PASS or ❌ FAIL with error message
```

---

## Key Patterns Summary

| Pattern | Problem | Solution | Where Used |
|---------|---------|----------|-----------|
| **JWT Tokens** | How to remember logged-in users | Token in header with every request | All protected routes |
| **Middleware** | Repetitive checks in every route | Chain of pre-processors | server.js |
| **Validation** | Invalid data in database | Check fields before DB access | validation.js |
| **State Machine** | Random status changes | Define only valid transitions | welfareController.js |
| **Transactions** | Inconsistent database state | All-or-nothing database changes | Controllers |
| **React Context** | Prop drilling nightmare | Global shared state | AuthContext.jsx |
| **Interceptors** | Attach token to every request | Axios pre/post processing | apiClient.js |
| **Error Handler** | Different error handling everywhere | Centralized error formatting | errorHandler.js |
| **ORM** | SQL injections and errors | Abstract database queries | all models |
| **Rate Limiting** | Bot attacks and DoS | Limit requests per IP | server.js |
| **Sanitization** | XSS and injection attacks | Clean malicious input | sanitization.js |
| **Indexing** | Slow database queries | Fast lookups with indexes | models |
| **Testing** | Manual verification | Automated tests | jest |

---

## Best Practices

```javascript
// ✅ DO:
- Use TypeScript if possible (catches errors early)
- Write tests (confidence in code)
- Use transactions (data consistency)
- Validate input (security)
- Handle errors (don't crash)
- Use indexes (performance)
- Log important events (debugging)
- Use constants (DRY principle)

// ❌ DON'T:
- Trust user input (always validate)
- Expose stack traces in production (security)
- Make database changes without transaction (data corruption)
- Repeat code (DRY principle - Don't Repeat Yourself)
- Use global variables (hard to track)
- Make synchronous database calls in loops (performance)
- Store sensitive data in localStorage (security)
- Catch but ignore errors (silent failures)
```

---

**Document Version:** 1.0  
**Last Updated:** April 16, 2025  
**Purpose:** Learning guide for EduZone patterns
