# EduZone Frontend Developer Onboarding Guide

Welcome to the EduZone project! This guide will help you get up to speed with the frontend codebase quickly.

---

## 📚 Documentation Overview

We have comprehensive documentation covering 50%+ of the frontend codebase. Start here:

1. **FRONTEND_DOCS_README.md** - Quick navigation guide
2. **FRONTEND_QUICK_REFERENCE.md** - Feature and file lookup
3. **DOCUMENTATION.md** - Deep architecture and flows
4. **DOCUMENTATION_EXAMPLES.md** - Code patterns and examples
5. **Individual File Comments** - Detailed inline documentation

---

## 🚀 First Week Plan

### Day 1: Setup & Overview (2-3 hours)

**Morning: Environment Setup**
```bash
# Clone repository
git clone <repo-url>

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Check Node version (should be 16+)
node --version
```

**Afternoon: Read Core Documentation**
1. Read `FRONTEND_DOCS_README.md` (15 min)
2. Review `DOCUMENTATION.md` - Architecture section (30 min)
3. Check `FRONTEND_QUICK_REFERENCE.md` - Overview (20 min)
4. Read color scheme and styling guide in `DOCUMENTATION_EXAMPLES.md` (15 min)

**Key Concepts to Understand**
- ✅ React + Vite setup
- ✅ Tailwind CSS with custom theme
- ✅ JWT token-based authentication
- ✅ React Context for global state
- ✅ React Router v6 for routing

---

### Day 2: Authentication Deep Dive (2-3 hours)

**Read & Understand These Files (In Order)**

1. **Start with Login.jsx** (20 min)
   - Location: `pages/Login.jsx`
   - What you'll learn: Form handling, authentication UI
   - Note: All form fields are documented with inline comments

2. **Study authService.js** (15 min)
   - Location: `services/authService.js`
   - What you'll learn: All 10 authentication API endpoints
   - Note: Each function has detailed "Purpose", "Flow", "Error" sections

3. **Understand Token Refresh** (30 min)
   - Read: `services/apiClient.js` comments (focus on token refresh strategy)
   - Read: `utils/tokenHelper.js` (token utilities)
   - Key insight: Proactive refresh (every 60s) + Reactive refresh (on 401)

4. **Master AuthContext.jsx** (30 min)
   - Location: `context/AuthContext.jsx`
   - What you'll learn: Global auth state management
   - Note: Extensive comments explain all effects, state variables, and functions
   - Key hook: `useAuth()` - used in most protected components

**Hands-on Exercise**
```javascript
// Try using the auth context in a component
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, role, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <p>Not logged in</p>;
  
  return (
    <>
      <p>Welcome, {user.name}!</p>
      <p>Your role: {role}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

---

### Day 3: Pages & Forms (2-3 hours)

**Understand Form Patterns**

1. **DonorRegistration.jsx** (30 min)
   - Multi-field form with validation
   - Password strength validation
   - API integration pattern

2. **ForgotPassword.jsx & ResetPassword.jsx** (20 min)
   - Multi-step forms
   - Success state handling
   - Error management

3. **ChangePassword.jsx** (15 min)
   - Modal component pattern
   - Current password verification
   - In-app state update

**Key Pattern Observation**
All forms follow this structure:
```javascript
// 1. State for form fields
const [email, setEmail] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

// 2. Handle submit
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    await authService.functionName(data);
    // Success: redirect or show message
  } catch (err) {
    setError(err.response?.data?.message || 'Error occurred');
  } finally {
    setLoading(false);
  }
};

// 3. Render form with fields
// All commented with purpose, validation, state management
```

---

### Day 4: Utilities & Constants (1-2 hours)

**Essential Utilities**

1. **Password Validation** (15 min)
   - File: `utils/passwordValidation.js`
   - Rules: 8+ chars, uppercase, lowercase, number, special char
   - Usage: Called during registration, password change

2. **Token Helper** (15 min)
   - File: `utils/tokenHelper.js`
   - Functions: Get/set tokens, decode, check validity, check expiration
   - Used by: authService, apiClient, AuthContext

3. **Constants** (15 min)
   - File: `utils/subjects.js`
   - Contains: SUBJECTS (21), GRADES (6-13), SECTIONS (A-E)
   - Usage: Dropdowns, filters, forms

**Example: Using Constants**
```javascript
import { SUBJECTS, GRADES } from '@/utils/subjects';

function ResourceFilter() {
  return (
    <>
      <select>
        {GRADES.map(grade => (
          <option key={grade}>Grade {grade}</option>
        ))}
      </select>
      
      <select>
        {SUBJECTS.map(subject => (
          <option key={subject}>{subject}</option>
        ))}
      </select>
    </>
  );
}
```

---

### Day 5: Public Features & Error Handling (2 hours)

**Public Pages (No Login Required)**

1. **Home.jsx** (20 min)
   - Landing page with navigation
   - Hero section with animated background
   - Statistics and portal cards
   - Well-documented with section comments

2. **PublicResources.jsx** (30 min)
   - Resource library with search & filters
   - API integration pattern
   - Loading and empty states
   - Grid layout

**Error Pages**

3. **NotFound.jsx** (10 min)
   - 404 page structure
   - Simple but well-documented UI pattern

4. **Unauthorized.jsx** (10 min)
   - 403 access denied page
   - Shown when user lacks permissions

---

## 🎯 Core Concepts Quick Reference

### JWT Token Flow
```
LOGIN
  ↓
Backend validates credentials
  ↓
Returns: { token: "...", refreshToken: "...", user: {...} }
  ↓
AuthContext.login() stores both tokens
  ↓
Components use useAuth() to access user data
  ↓
Every API request automatically includes token in header
  ↓
Token expires in 15 minutes
  ↓
AuthContext proactively refreshes every 60 seconds if needed
  ↓
OR API returns 401 → trigger reactive refresh
```

### Component Authentication Check Pattern
```javascript
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### API Call Pattern
```javascript
import client from '@/services/apiClient';

async function fetchData() {
  try {
    // Token automatically added to request header
    const response = await client.get('/api/endpoint');
    console.log(response.data);
  } catch (error) {
    // 401 automatically handled by apiClient (token refresh)
    // 400+ errors need to be handled here
    console.error(error.response?.data?.message);
  }
}
```

### Form Validation Pattern
```javascript
import { validatePassword } from '@/utils/passwordValidation';

function PasswordForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    // Show error as user types
    setError(validatePassword(pwd) || '');
  };
  
  return (
    <>
      <input 
        type="password" 
        value={password}
        onChange={handleChange}
      />
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

---

## 📁 File Organization

```
src/
├── pages/
│   ├── [Authentication Pages]
│   │   ├── Login.jsx ✅ Documented
│   │   ├── DonorRegistration.jsx ✅ Documented
│   │   ├── ActivateAccount.jsx (OTP verification)
│   │   ├── ForgotPassword.jsx ✅ Documented
│   │   ├── ResetPassword.jsx ✅ Documented
│   │
│   ├── [Public Pages]
│   │   ├── Home.jsx ✅ Documented
│   │   ├── PublicResources.jsx ✅ Documented
│   │
│   ├── [Error Pages]
│   │   ├── NotFound.jsx ✅ Documented (404)
│   │   ├── Unauthorized.jsx ✅ Documented (403)
│   │
│   └── [Role-Based Dashboards - TBD]
│       ├── teacher/
│       ├── principal/
│       ├── zeo/
│       └── donor/
│
├── services/
│   ├── apiClient.js ✅ Advanced HTTP client with token refresh
│   ├── axiosConfig.js ✅ Basic Axios config
│   ├── authService.js ✅ Auth API wrapper (10 functions)
│   └── schoolService.js (school/student management)
│
├── context/
│   ├── AuthContext.jsx ✅ Global authentication state
│   └── [OtherContexts - TBD]
│
├── components/
│   ├── ChangePassword.jsx ✅ Password change modal
│   ├── ui/ (Shadcn/ui components)
│   └── [Other components - TBD]
│
├── utils/
│   ├── passwordValidation.js ✅ Password strength check
│   ├── tokenHelper.js ✅ Token management utilities
│   ├── subjects.js ✅ Constants (subjects, grades, sections)
│   └── [Other utilities]
│
└── routes/
    ├── AppRouter.jsx (main routing)
    ├── ProtectedRoute.jsx (role-based routing)
    └── [specific route files]
```

---

## 💡 Best Practices

### When Reading Code Comments
1. **Read the purpose** - Understand why before the what
2. **Scan the flow** - Get the big picture
3. **Check error cases** - Understand what can go wrong
4. **Look at examples** - See how it's actually used
5. **Read inline comments** - Understand specific implementations

### When Writing Code
1. **Follow existing patterns** - Check similar files first
2. **Add comments to new functions** - Document purpose + flow
3. **Explain the why** - Not just what the code does
4. **Include error handling** - Show what can go wrong
5. **Provide usage examples** - Show where it's used

### When Debugging
1. **Check file comments first** - May explain the issue
2. **Look at similar working code** - Compare patterns
3. **Trace the flow** - Follow documented steps
4. **Check error pages** - NotFound.jsx and Unauthorized.jsx show routing issues
5. **Use browser DevTools** - Redux DevTools, React DevTools

---

## 🔧 Common Development Tasks

### Adding a New Authenticated Page
```javascript
// 1. Create component with auth check
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function NewPage() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Your page here
}

// 2. Add to routes (AppRouter.jsx)
// <Route path="/newpage" element={<NewPage />} />

// 3. Add role check if needed
const { role } = useAuth();
if (role !== 'teacher') return <Navigate to="/unauthorized" />;
```

### Adding Form Validation
```javascript
import { validatePassword } from '@/utils/passwordValidation';

// In your form component
const error = validatePassword(userInput);
if (error) {
  // Show error to user
}
```

### Making API Calls
```javascript
import client from '@/services/apiClient';

// GET request
const data = await client.get('/api/endpoint');

// POST request
const response = await client.post('/api/endpoint', { key: 'value' });

// PUT request
await client.put('/api/endpoint/id', { updates });

// DELETE request
await client.delete('/api/endpoint/id');

// Token is automatically included in all requests!
```

### Adding New Constants
```javascript
// In src/utils/subjects.js
export const MY_CONSTANTS = [
  'option1',
  'option2',
  'option3'
];

// Then import and use
import { MY_CONSTANTS } from '@/utils/subjects';
MY_CONSTANTS.map(item => <option>{item}</option>)
```

---

## 🆘 Troubleshooting

### "useAuth must be used within an AuthProvider"
- **Cause:** Component using `useAuth()` is not under `<AuthProvider>`
- **Fix:** Check `App.jsx` - ensure routing is inside AuthProvider

### Token keeps expiring
- **Cause:** Token refresh might not be working
- **Fix:** Check `apiClient.js` - refresh token logic is there. Check backend endpoint.

### Login doesn't work
- **Check:**
  1. Email/password correct?
  2. User account exists and activated?
  3. Backend server running?
  4. CORS configured?
  5. Check browser console for error details

### Redirect to login page keeps happening
- **Cause:** Token missing or invalid
- **Fix:** 
  1. Check localStorage has 'token' key
  2. Verify token isn't expired
  3. Try logging in again

---

## 📞 Getting Help

### Documentation Resources
1. **Check file comments** - All functions have detailed comments
2. **Read DOCUMENTATION.md** - Architecture and flows
3. **Review examples** - DOCUMENTATION_EXAMPLES.md
4. **Search codebase** - Find similar implementations

### When Stuck
1. Read the error message carefully
2. Check browser console for details
3. Look at similar working code
4. Review the relevant file's comments
5. Check git history for similar changes
6. Ask experienced team member

---

## 🎓 Learning Path

### Week 1 (Recommended)
- Day 1: Setup + Overview
- Day 2: Authentication system
- Day 3: Pages & Forms
- Day 4: Utilities & Constants
- Day 5: Public features & Error handling

### Week 2+
- Start with small bug fixes
- Make form field improvements
- Add validation to existing forms
- Create new UI components
- Graduate to larger features

---

## ✅ Onboarding Checklist

- [ ] Node.js installed (v16+)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Can start dev server (`npm run dev`)
- [ ] Read FRONTEND_DOCS_README.md
- [ ] Read DOCUMENTATION.md - Architecture section
- [ ] Understood JWT token flow
- [ ] Read authService.js comments
- [ ] Read AuthContext.jsx comments
- [ ] Understand useAuth() hook
- [ ] Can explain form validation pattern
- [ ] Reviewed DOCUMENTATION_EXAMPLES.md
- [ ] Made at least one small code change
- [ ] All changes committed with clear messages

---

## 🚀 Next Steps After Onboarding

1. **Review Issues/Tasks** - Start with "good first issue" labels
2. **Pick a Small Feature** - Bug fix or small enhancement
3. **Follow Code Review** - Learn from feedback
4. **Gradually Increase Complexity** - Bigger features
5. **Contribute Documentation** - Document new features you add

---

## 📚 Additional Resources

- **React Docs:** https://react.dev
- **React Router:** https://reactrouter.com
- **Tailwind CSS:** https://tailwindcss.com
- **Vite:** https://vitejs.dev
- **Axios:** https://axios-http.com
- **JWT:** https://jwt.io

---

**Welcome to the team! Happy coding! 🎉**

For questions about specific files or features, check the comprehensive comments in those files first.
