# 🔐 Authentication Flow: Detailed Walkthrough

## What is Authentication?

Authentication = System verifying "You are who you claim to be"

In EduZone, this means: Checking your email and password are correct, then giving you a token to use the app.

---

## 1. Donor Registration (Sign Up) - Complete Flow

### What You See (Frontend)

**User visits**: `http://localhost:3000/register`

**Page**: `frontend/src/pages/DonorRegistration.jsx`

**Form asks for**:
```
Name:              [John Smith      ]
Email:             [john@gmail.com  ]
Password:          [••••••••        ] (hidden)
Organization:      [My Charity      ]
[Register Button]
```

### Step 1: User Fills Form & Clicks "Register"

**File**: `DonorRegistration.jsx`

```javascript
// When user clicks Register button, this function runs:
const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    
    // Get form values
    const { name, email, password, organizationName } = formData;
    
    // Validate form (check for empty fields)
    if (!email || !password) {
        setError('Please fill all fields');
        return;  // Stop, don't proceed
    }
    
    // Show loading spinner while request is sent
    setLoading(true);
    
    try {
        // Call backend to register
        const response = await authApi.registerDonor({
            name,
            email,
            password,
            organizationName
        });
        
        // If successful, show message
        if (response.success) {
            toast.success('Check your email for verification code!');
            
            // Wait 2 seconds then redirect to verification page
            setTimeout(() => {
                navigate('/activate-account', {
                    state: { email: email }
                });
            }, 2000);
        }
    } catch (error) {
        // If failed, show error message
        setError(error.response?.data?.message);
    } finally {
        // Hide loading spinner
        setLoading(false);
    }
};
```

### Step 2: Frontend Sends Data to Backend

**File**: `frontend/src/services/authService.js`

```javascript
// This is what authApi.registerDonor() does:
export const authApi = {
    registerDonor: async (donorData) => {
        // Send HTTP POST request to backend
        const response = await client.post('/auth/register/donor', {
            name: donorData.name,
            email: donorData.email,
            password: donorData.password,
            organizationName: donorData.organizationName
        });
        
        // Return the response from backend
        return response.data;
    }
};
```

**What gets sent over the internet**:
```
POST http://localhost:5000/auth/register/donor
{
    "name": "John Smith",
    "email": "john@gmail.com",
    "password": "MyPass123!",
    "organizationName": "My Charity"
}
```

### Step 3: Backend Receives Request

**File**: `backend/routes/authRoutes.js`

```javascript
// This route receives the POST request:
router.post('/register/donor', 
    validationRules.donorRegistration(),  // Check data is valid format
    validate,                               // Run validation
    asyncHandler(registerDonor)             // Call registerDonor function
);
```

The `asyncHandler` wrapper ensures:
- If no error: call `registerDonor()`
- If error occurs: catch it automatically and send error response

### Step 4: Backend Processes Registration

**File**: `backend/controllers/authController.js` → `registerDonor()` function

Let me explain the actual code step-by-step:

```javascript
const registerDonor = async (req, res) => {
    // ============ STEP 1: GET & CLEAN DATA ============
    const { name, email, password, organizationName } = req.body;
    // Why lowercase email? So "John@Gmail.com" and "john@gmail.com" are treated same
    const cleanEmail = email.trim().toLowerCase();

    // ============ STEP 2: VALIDATE PASSWORD ============
    const passwordError = validatePassword(password);
    // validatePassword() checks:
    // - At least 8 characters
    // - Has uppercase letter (A-Z)
    // - Has lowercase letter (a-z)
    // - Has number (0-9)
    // - Has special character (!@#$%^&*)
    
    if (passwordError) {
        // Password too weak, send error back immediately
        return res.status(400).json({ 
            success: false, 
            message: passwordError  // e.g., "Password must contain uppercase letter"
        });
    }

    // ============ STEP 3: START DATABASE TRANSACTION ============
    // Transaction = "all or nothing"
    // Either ALL operations succeed and save, or ALL fail and rollback
    // This prevents weird situations like:
    // - User created BUT email failed so they can't verify
    // - Only half the data in database
    const { sequelize } = require('../models');
    const transaction = await sequelize.transaction();

    try {
        // ============ STEP 4: CHECK IF EMAIL ALREADY EXISTS ============
        const userExists = await User.findOne(
            { where: { email: cleanEmail } },
            { transaction }  // Use transaction for consistency
        );
        
        if (userExists) {
            // Email already registered!
            await transaction.rollback();  // Cancel everything
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // ============ STEP 5: HASH PASSWORD ============
        // Never store plain passwords! This would be a HUGE security risk.
        // Instead, convert to one-way encrypted form:
        const salt = await bcrypt.genSalt(10);
        // salt = random encryption salt (makes hashes harder to crack)
        
        const hashedPassword = await bcrypt.hash(password, salt);
        // hashedPassword = encrypted, looks like: "$2a$10$N9qo8uLOickgx2Z..."
        // If database is stolen, hackers can't figure out original password

        // ============ STEP 6: GENERATE VERIFICATION CODE ============
        // Create 6-digit code (100000 to 999999)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Example result: "482739"
        
        // Code expires in 15 minutes
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

        // ============ STEP 7: CREATE USER IN DATABASE ============
        // This creates a row in the User table
        const user = await User.create({
            fullName: name,
            email: cleanEmail,
            passwordHash: hashedPassword,  // Hashed password, not plain!
            role: 'DONOR',  // This person is registering as donor
            isVerified: false,  // Not verified until they enter code
            activationToken: verificationCode,
            activationExpires: verificationExpires
        }, { transaction });
        
        // After this, database has a User row:
        // User #1: {
        //   id: 1,
        //   fullName: "John Smith",
        //   email: "john@gmail.com",
        //   passwordHash: "$2a$10$...",
        //   role: "DONOR",
        //   isVerified: false
        // }

        // ============ STEP 8: CREATE DONOR PROFILE ============
        // User table = basic login info (email, password)
        // Donor table = donor-specific info (organization name, etc)
        // They're linked by userId
        await Donor.create({
            userId: user.id,  // Link to User #1
            organizationName: organizationName || name  // Use org name or person name
        }, { transaction });
        
        // Now database has a Donor row:
        // Donor #1: {
        //   id: 1,
        //   userId: 1,
        //   organizationName: "My Charity"
        // }

        // ============ STEP 9: SEND VERIFICATION EMAIL ============
        let emailSent = false;
        
        try {
            // Call email service to send verification email
            await sendEmail({
                email: user.email,  // john@gmail.com
                subject: 'Verify Your EduZone Donor Account',
                html: `
                    <h2>Welcome to EduZone!</h2>
                    <p>Your verification code is: <strong>482739</strong></p>
                    <p>This code expires in 15 minutes.</p>
                `
            });
            emailSent = true;  // Mark as successful
        } catch (err) {
            // Email service failed! This could be:
            // - No internet
            // - Email server down
            // - Gmail API issue
            // Etc.
            console.error("Email send failed:", err.message);
        }

        // ============ STEP 10: CHECK IF EMAIL SUCCEEDED ============
        if (!emailSent) {
            // Email failed! We can't complete registration
            // Don't want user to register but never get verification email
            
            // ROLLBACK = undo Step 7 and 8
            // Delete User row
            // Delete Donor row
            await transaction.rollback();

            return res.status(503).json({
                success: false,
                message: 'Email service temporarily unavailable. Please try again later.',
                code: 'EMAIL_SERVICE_ERROR'
            });
        }

        // ============ STEP 11: COMMIT TRANSACTION ============
        // Email succeeded! All changes are final.
        // User and Donor rows are now permanently in database
        await transaction.commit();

        // ============ STEP 12: SEND SUCCESS RESPONSE ============
        res.status(201).json({
            success: true,
            message: 'Registration successful! Verification code sent to your email.',
            user: {
                id: user.id,
                name: user.fullName,
                role: user.role,
                email: cleanEmail
            },
            verificationCodeExpiry: 15  // Tell frontend: code expires in 15 minutes
        });

    } catch (error) {
        // Unexpected error (database error, etc)
        // Rollback everything
        if (transaction) await transaction.rollback();

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            code: 'REGISTRATION_ERROR'
        });
    }
};
```

### Step 5: Frontend Shows Success Message

**File**: `DonorRegistration.jsx`

Frontend receives response:
```javascript
{
    "success": true,
    "message": "Registration successful! Verification code sent to your email.",
    "user": {
        "id": 1,
        "name": "John Smith",
        "role": "DONOR",
        "email": "john@gmail.com"
    },
    "verificationCodeExpiry": 15
}
```

Frontend shows:
- ✅ Green success message
- Toast notification: "Check your email for verification code!"
- After 2 seconds, redirect to `/activate-account` page

### Step 6: User Receives Email

**Email sent to**: john@gmail.com

**Email content**:
```
Subject: Verify Your EduZone Donor Account

Welcome to EduZone!
Your verification code is: 482739
This code expires in 15 minutes.

If you didn't request this, please ignore this email.
```

### Step 7: User Enters Verification Code

**User visits**: `http://localhost:3000/activate-account`

**Page**: `frontend/src/pages/ActivateAccount.jsx`

**Form asks for**:
```
Verification Code: [482739]
Password:          [••••••••] 
Confirm Password:  [••••••••]
[Verify Button]
```

### Step 8: Frontend Sends Verification Code to Backend

**File**: `ActivateAccount.jsx`

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get verification code from form
    const { code, password } = formData;
    
    try {
        // Send to backend to verify
        const response = await authApi.verifyEmail({
            email: email,  // From earlier registration
            code: code      // 482739
        });
        
        if (response.success) {
            // Verification successful!
            // Now the user is verified and can login
            toast.success('Email verified! You can now login.');
            navigate('/login');
        }
    } catch (error) {
        toast.error(error.response?.data?.message);
    }
};
```

### Step 9: Backend Verifies Code

**File**: `backend/controllers/authController.js` → `verifyEmail()` function

```javascript
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;  // "john@gmail.com", "482739"
    const cleanEmail = email.trim().toLowerCase();

    try {
        // ============ FIND USER WITH THIS EMAIL AND CODE ============
        const user = await User.findOne({
            where: {
                email: cleanEmail,
                activationToken: code,  // Code matches?
                activationExpires: { [Op.gt]: new Date() }  // Code not expired?
            }
        });

        // ============ CHECK IF FOUND ============
        if (!user) {
            // Either:
            // - Email doesn't exist
            // - Code is wrong
            // - Code expired (> 15 minutes old)
            return res.status(400).json({ 
                message: 'Invalid or expired verification code' 
            });
        }

        // ============ CODE IS VALID! MARK USER AS VERIFIED ============
        user.isVerified = true;       // User is now verified!
        user.isActive = true;         // Account is active
        user.activationToken = null;  // Clear code (can't reuse)
        user.activationExpires = null;
        await user.save();            // Save changes to database

        // ============ CREATE TOKENS FOR AUTO-LOGIN ============
        // User is verified! Let's automatically log them in (better UX)
        const token = generateAccessToken(user);      // 15-minute token
        const refreshToken = generateRefreshToken(user);  // 7-day token

        // ============ SEND SUCCESS ============
        res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully',
            token: token,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

### Step 10: User Logged In!

Frontend receives tokens and:
1. Saves `token` in localStorage
2. Saves `refreshToken` in localStorage
3. Updates global auth state (AuthContext)
4. Redirects to dashboard

---

## 2. Login Flow (Much Simpler!)

### User Visits Login Page

**URL**: `http://localhost:3000/login`

**Page**: `frontend/src/pages/Login.jsx`

### User Fills Form

```
Email:    [john@gmail.com]
Password: [••••••••••    ]
[Login Button]
```

### Frontend Sends Email + Password to Backend

```javascript
const handleLogin = async () => {
    try {
        const response = await authApi.login({
            email: email,
            password: password
        });
        
        if (response.success) {
            // Save tokens
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            // Update auth context
            setUser(response);
            
            // Redirect to appropriate dashboard
            navigate(`/${response.role.toLowerCase()}/dashboard`);
        }
    } catch (error) {
        toast.error('Invalid credentials');
    }
};
```

### Backend Receives Login Request

**File**: `backend/routes/authRoutes.js`

```javascript
router.post('/login', 
    validationRules.login(),  // Validate email format
    validate,
    asyncHandler(loginUser)   // Call login function
);
```

### Backend Verifies Credentials

**File**: `backend/controllers/authController.js` → `loginUser()` function

```javascript
const loginUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();  // Clean email
    const cleanPassword = password.trim();

    try {
        // ============ FIND USER BY EMAIL ============
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            // Email not registered
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // ============ CHECK IF PASSWORD MATCHES ============
        // Compare plain password with hashed password from database
        // bcrypt.compare() returns true/false
        const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
        // "MyPass123!" compared to "$2a$10$N9qo8..."
        // bcrypt knows how to verify!

        if (!isMatch) {
            // Password wrong
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // ============ CHECK IF EMAIL VERIFIED ============
        if (!user.isVerified) {
            // User registered but never verified email
            return res.status(401).json({ 
                success: false, 
                message: 'Email not verified. Check your email for verification code.' 
            });
        }

        // ============ PASSWORD CORRECT! GENERATE TOKENS ============
        const accessToken = generateAccessToken(user);    // 15-minute token
        const refreshToken = generateRefreshToken(user);  // 7-day token

        // Store refresh token in database
        // (used to verify refresh token legitimacy later)
        user.refreshToken = refreshToken;
        await user.save();

        // ============ GET ROLE-SPECIFIC DATA ============
        // For teachers/principals, also fetch their school
        let schoolName = null;
        let schoolId = null;
        
        if (user.role === 'TEACHER') {
            const teacher = await Teacher.findOne({
                where: { userId: user.id },
                include: [{ model: School, as: 'school' }]
            });
            schoolName = teacher?.school?.name;
            schoolId = teacher?.schoolId;
        }
        // (Similar logic for PRINCIPAL)

        // ============ SEND TOKENS TO FRONTEND ============
        res.status(200).json({
            success: true,
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            school: schoolName,
            schoolId: schoolId,
            token: accessToken,         // Frontend stores this
            refreshToken: refreshToken  // Frontend stores this too
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Frontend Stores Tokens

**File**: `frontend/src/context/AuthContext.jsx`

```javascript
// After receiving tokens from login:
const token = response.token;
const refreshToken = response.refreshToken;

// Save to browser storage
localStorage.setItem('token', token);
localStorage.setItem('refreshToken', refreshToken);

// Update global auth state
setUser({
    id: response.id,
    name: response.name,
    email: response.email,
    role: response.role
});

// Redirect to dashboard
navigate(`/${response.role.toLowerCase()}/dashboard`);
```

### User Logged In!

Now every API request includes the token automatically.

**How?** Through the API client interceptor:

**File**: `frontend/src/services/apiClient.js`

```javascript
// Whenever any component makes an API request:
client.post('/welfare', { ... });

// The interceptor automatically adds:
// Headers: {
//   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
// }

// This tells backend: "I have a token, I'm authorized!"
```

### Accessing Protected Pages

**File**: `frontend/src/routes/ProtectedRoute.jsx`

```javascript
// When user tries to access /teacher/dashboard
// ProtectedRoute checks:
// 1. Is there a valid token? 
// 2. Is user role === 'TEACHER'?
// 3. If YES: Show dashboard
// 4. If NO: Redirect to login
```

---

## 3. Token Refresh Flow (Automatic Background Task)

### The Problem

User logs in at 9:00 AM with 15-minute access token (expires at 9:15 AM).

If user keeps working until 10:00 AM, token expired at 9:15 AM!

Without refresh: "You're logged out! Re-login!"

Bad UX! 😞

### The Solution

Every 60 seconds, check: "Will my token expire in the next 5 minutes?"

If YES: Automatically refresh it BEFORE it expires!

### How It Works

**File**: `frontend/src/context/AuthContext.jsx`

```javascript
// Every time AuthProvider component loads:
useEffect(() => {
    // Set up interval: every 60 seconds, check token
    const refreshInterval = setInterval(async () => {
        // ============ GET CURRENT TOKENS ============
        const token = getToken();            // Read from localStorage
        const refreshToken = getRefreshToken();

        // ============ CHECK: WILL TOKEN EXPIRE SOON? ============
        // isTokenExpiring() checks: token expires in < 5 minutes?
        if (token && refreshToken && isTokenExpiring(token, 5)) {
            // YES! Token expiring soon

            // ============ PREVENT MULTIPLE REFRESHES ============
            // If already refreshing, don't refresh again
            if (!isRefreshing) {
                try {
                    setIsRefreshing(true);  // Mark as: refreshing now

                    // ============ CALL REFRESH ENDPOINT ============
                    const response = await client.post('/auth/refresh', {
                        refreshToken: refreshToken
                    });

                    // ============ SAVE NEW TOKEN ============
                    if (response.data.token) {
                        saveToken(response.data.token);  // Update localStorage
                    }

                    // If server sent new refresh token too, save it
                    if (response.data.refreshToken) {
                        saveRefreshToken(response.data.refreshToken);
                    }

                } catch (err) {
                    // Refresh failed!
                    // Could mean: refresh token expired (> 7 days)
                    // User must re-login
                    console.error('Proactive token refresh failed:', err);
                    handleLogout();  // Force logout
                } finally {
                    setIsRefreshing(false);  // Mark as: refresh done
                }
            }
        }

    }, 60000);  // Run every 60 seconds (60,000 milliseconds)

    return () => clearInterval(refreshInterval);  // Clean up when component unloads
}, []);
```

### Backend Processes Refresh Request

**File**: `backend/controllers/authController.js` → `refreshTokenEndpoint()` function

```javascript
const refreshTokenEndpoint = async (req, res) => {
    const { refreshToken } = req.body;  // Frontend sends refresh token
    
    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            message: 'Refresh token is required' 
        });
    }

    try {
        // ============ VERIFY REFRESH TOKEN ============
        // Decode the JWT using REFRESH_TOKEN_SECRET
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // ============ CHECK: IS THIS ACTUALLY A REFRESH TOKEN? ============
        // (Not an access token by mistake)
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token type' 
            });
        }

        // ============ FIND USER ============
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // ============ VERIFY TOKEN MATCHES DB ============
        // When user logs out, we delete refresh token from DB
        // If token doesn't match DB version, it's been revoked/logged out
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token has been revoked' 
            });
        }

        // ============ ALL CHECKS PASSED! GENERATE NEW ACCESS TOKEN ============
        const newAccessToken = generateAccessToken(user);

        // ============ SEND NEW TOKEN ============
        res.status(200).json({
            success: true,
            token: newAccessToken  // NEW 15-minute token!
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token expired' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid refresh token' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Token refresh failed' 
        });
    }
};
```

### Frontend Updates Token

```javascript
// Frontend receives new token
const newAccessToken = response.data.token;

// Save it
localStorage.setItem('token', newAccessToken);

// Done! User never noticed token refresh happened!
// User continues working seamlessly
```

---

## 4. Key Concepts Explained

### JWT (JSON Web Token)

**What is it?**

A token = proof of identity

```
Header: { algorithm: "HS256", type: "JWT" }
Payload: { id: 1, role: "DONOR", exp: 1234567890 }
Signature: HMACSHA256(base64(Header) + base64(Payload), secret)

Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkRPTk9SIn0.abcd...
```

**Why use it?**
- Can't be forged (signed with secret)
- Can't be modified (signature changes)
- Contains user info (no need to look up database on every request)
- Expires automatically (15 minutes)

### Hashing vs Encrypting

**Hashing** (Password):
- One-way (can't decode back)
- Same input = same output
- Used for: passwords
- Example: "MyPass123!" → "$2a$10$..."

**Encrypting** (JWT):
- Two-way (can decode)
- Uses key to encrypt/decrypt
- Used for: tokens, sensitive data
- Example: `eyJhbGc...` ← encrypted, but can be decrypted with secret

### Refresh Token Rotation

Why have 2 tokens (access + refresh)?

**If only access token:**
- Problem: If hacked, attacker has access for 15 minutes
- Can't revoke it (it's valid until expiry)

**With 2 tokens:**
- Access token: Short-lived (15 min), stolen = limited damage
- Refresh token: Long-lived (7 days), stored securely, rarely sent
- On refresh: Can check if token is still in DB (user might have logged out)
- If user logs out: Delete refresh token from DB, revoke immediately!

---

## Security Practices in Authentication

### 1. Password Hashing
✅ Never store plain passwords  
✅ Use bcrypt (adds salt, slow to crack)  
✅ Check password with bcrypt.compare()

### 2. Token Security
✅ Store in localStorage (not easily stolen by JavaScript)  
✅ Set reasonable expiry (15 min access, 7 days refresh)  
✅ Revoke on logout (delete from DB)  
✅ HTTPS only (tokens over encrypted connection)

### 3. Verification Required
✅ Email verification before account is active  
✅ Prevents typos in email address  
✅ Confirms user owns email address

### 4. Rate Limiting
✅ Maximum 10 login attempts per 15 minutes per IP  
✅ Prevents brute force attacks  
✅ See: authLimiter in authRoutes.js

### 5. Constant-Time Response
✅ "Forgot password" always returns same message  
✅ Prevents email enumeration attack  
✅ (Attacker can't tell which emails are registered)

---

## Testing the Flow

### Test Registration
1. Visit http://localhost:3000/register
2. Fill form
3. Click Register
4. Check email for verification code
5. Enter code on activation page
6. Success!

### Test Login
1. Visit http://localhost:3000/login
2. Enter credentials
3. Click Login
4. Should redirect to dashboard

### Test Token Refresh
1. Login
2. Open browser DevTools → Application → LocalStorage
3. See `token` and `refreshToken`
4. Wait 60 seconds
5. See `token` changed (refreshed automatically!)
6. Check console logs for "Token refreshed successfully"

### Test Logout
1. Click Logout button
2. Redirects to login
3. Try going back to dashboard
4. Can't access (redirected to login)
5. Try using stored token manually
6. Won't work (token revoked from DB)

---

## Common Issues & Solutions

### "Invalid credentials"
- Check: Email is registered?
- Check: Email is verified?
- Check: Password is correct?

### "Email not verified"
- Check: Did you enter verification code?
- Check: Code not expired (15 min)?
- Solution: Re-register and try again

### "Refresh token expired"
- Can happen if: User hasn't used app for 7+ days
- Solution: Login again

### "Too many login attempts"
- Cause: Tried to login 10+ times in 15 minutes
- Solution: Wait 15 minutes and try again

---

You now understand the complete authentication flow! This is the foundation of everything in EduZone. 🎉
