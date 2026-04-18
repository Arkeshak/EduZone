# EduZone Frontend Documentation Quick Reference

## Navigation Guide

### 📋 Documentation Files
- **FRONTEND_DOCS_README.md** - Start here! Overview and quick navigation
- **DOCUMENTATION.md** - Deep dive: Architecture, flows, API endpoints, best practices
- **DOCUMENTATION_SUMMARY.md** - Task completion report and statistics
- **DOCUMENTATION_EXAMPLES.md** - Code examples and pattern guidelines
- **PHASE_2_DOCUMENTATION_COMPLETE.md** - Phase 2 summary and status

---

## 🔐 Authentication System

### Phase 1: Login Flow
| File | Purpose | Key Elements |
|------|---------|--------------|
| `pages/Login.jsx` | User authentication | Email input, password input, role selector, forgot password link |
| `services/authService.js` | API wrapper | `login()`, `getCurrentUser()`, `changePassword()` functions |
| `services/apiClient.js` | HTTP client | Token refresh mechanism (proactive + reactive) |
| `utils/tokenHelper.js` | Token utilities | `getToken()`, `setToken()`, `isTokenValid()`, `isTokenExpiring()` |

### Phase 1: Registration Flow
| File | Purpose | Key Elements |
|------|---------|--------------|
| `pages/DonorRegistration.jsx` | New donor signup | Name, email, password (validated), phone, address, organization |
| `pages/ActivateAccount.jsx` | OTP verification | Code input for verification |
| `services/authService.js` | API wrapper | `registerDonor()`, `verifyEmail()`, `activateAccount()` |

### Phase 2: Password Management
| File | Purpose | Key Elements |
|------|---------|--------------|
| `pages/ForgotPassword.jsx` | Recovery start | Email input, reset link sent message |
| `pages/ResetPassword.jsx` | New password | Password inputs with show/hide toggle |
| `pages/ChangePassword.jsx` | In-app change | Current + new password modal |
| `services/authService.js` | API calls | `forgotPassword()`, `resetPassword()`, `changePassword()` |
| `utils/passwordValidation.js` | Validation rules | 8+ chars, uppercase, lowercase, number, special char |

### Context & State
| File | Purpose | Key Elements |
|------|---------|--------------|
| `context/AuthContext.jsx` | Global auth state | `useAuth()` hook, login/logout, token refresh logic |

---

## 🏠 Pages & Routes

### Public Pages
| File | Purpose | Status | Comments |
|------|---------|--------|----------|
| `pages/Home.jsx` | Landing page | ✅ Phase 1 | Hero, stats, portals, ZEO section |
| `pages/PublicResources.jsx` | Resource library | ✅ Phase 2 | Search, filters, grid display |
| `pages/NotFound.jsx` | 404 error page | ✅ Phase 2 | Error UI pattern |
| `pages/Unauthorized.jsx` | 403 access denied | ✅ Phase 2 | Permission error UI |

### Protected Pages (Pending)
| File | Purpose | Status | Location |
|------|---------|--------|----------|
| Dashboard pages | Role-specific dashboards | ⏳ Pending | `pages/teacher/`, `pages/principal/`, `pages/zeo/`, `pages/donor/` |

---

## 🔌 Services & API Integration

### API Clients
| File | Purpose | Comments | 
|------|---------|----------|
| `services/apiClient.js` | Advanced HTTP client | ✅ Documented - Proactive/reactive token refresh, queue management |
| `services/axiosConfig.js` | Basic HTTP config | ✅ Documented - Token injection, error handling |
| `services/authService.js` | Auth API wrapper | ✅ Phase 2 - 10 functions documented |
| `services/schoolService.js` | School API wrapper | ⏳ Pending |

### Token Management
```
Flow: User Login → Token Stored → Proactive Check (60s) → Auto-Refresh if Expiring
      API Call → 401 Error → Reactive Refresh → Retry Request
```

---

## 🎨 UI Components

### Component Library Location
- `components/ui/` - Shadcn/ui components (accordion, button, input, select, etc.)

### Custom Components
| File | Purpose | Status |
|------|---------|--------|
| `components/ChangePassword.jsx` | Password change modal | ✅ Phase 1 |
| `components/FileUploader.jsx` | File upload | ⏳ Pending |
| `components/LoadingSpinner.jsx` | Loading indicator | ⏳ Pending |
| `components/StatusBadge.jsx` | Status display | ⏳ Pending |
| `components/ImageWithFallback.jsx` | Image with fallback | ⏳ Pending |

---

## 📦 Utilities

### Password Validation
```javascript
import { validatePassword } from '@/utils/passwordValidation';
const error = validatePassword(userInput);
if (!error) { /* Password is strong */ }
```
**Requirements:** 8+ chars, uppercase, lowercase, number, special char

### Constants
```javascript
import { SUBJECTS, GRADES, SECTIONS } from '@/utils/subjects';
// SUBJECTS: 21 subjects (languages, academics, arts, vocational)
// GRADES: 6-13 (academic years)
// SECTIONS: A-E (class divisions)
```

### Token Utilities
```javascript
import { getToken, isTokenValid, isTokenExpiring } from '@/utils/tokenHelper';
const token = getToken();
if (isTokenValid()) { /* Use token */ }
if (isTokenExpiring(token, 5)) { /* Refresh in 5 min */ }
```

---

## 🛣️ Authentication Flow Diagrams

### Login to Dashboard
```
1. User enters email + password
2. Click Login button
3. authService.login() called
4. Backend validates credentials
5. Returns: { token, refreshToken, user }
6. AuthContext.login() stores tokens
7. setUser() updates state
8. useAuth() hook provides data to components
9. ProtectedRoute checks isAuthenticated
10. Dashboard page renders
```

### Token Expiration Handling
```
PROACTIVE (every 60 seconds):
- Check: token.exp - now < 5 minutes?
- YES → Call /auth/refresh
- Save new token
- Continue seamlessly

REACTIVE (on API error):
- API returns 401 (Unauthorized)
- Call /auth/refresh with refreshToken
- Queue remaining requests
- Retry original request with new token
- Resume normally
```

### Logout
```
1. User clicks Logout button
2. AuthContext.handleLogout() called
3. POST /auth/logout (notify backend)
4. removeToken() clears storage
5. setUser(null), setRole(null)
6. navigate('/login')
7. useAuth() hook shows unauthenticated
8. ProtectedRoute blocks access
9. Login page shown
```

---

## 🔍 Finding Documentation

### By Feature
- **Authentication** → `Login.jsx`, `authService.js`, `AuthContext.jsx`
- **Registration** → `DonorRegistration.jsx`, `ActivateAccount.jsx`
- **Password** → `ForgotPassword.jsx`, `ResetPassword.jsx`, `ChangePassword.jsx`
- **Resources** → `PublicResources.jsx`, `resourceRoutes.js`
- **Error Handling** → `NotFound.jsx`, `Unauthorized.jsx`, `apiClient.js`

### By File Type
- **Pages** → `src/pages/`
- **Services** → `src/services/`
- **Components** → `src/components/`
- **Context** → `src/context/`
- **Utils** → `src/utils/`
- **Routes** → `src/routes/`

### By Technology
- **API Calls** → `apiClient.js`, `authService.js`
- **State Management** → `AuthContext.jsx`
- **Validation** → `passwordValidation.js`
- **Routing** → `AppRouter.jsx`, `ProtectedRoute.jsx`
- **HTTP** → `axiosConfig.js`, `apiClient.js`

---

## 📊 Documentation Coverage

### Phase 1 (9 files - 100% documented)
✅ Login.jsx
✅ DonorRegistration.jsx
✅ ForgotPassword.jsx
✅ ResetPassword.jsx
✅ ChangePassword.jsx
✅ Home.jsx
✅ axiosConfig.js
✅ apiClient.js
✅ DOCUMENTATION.md (support)

### Phase 2 (8 files - 100% documented)
✅ authService.js
✅ AuthContext.jsx
✅ PublicResources.jsx
✅ NotFound.jsx
✅ Unauthorized.jsx
✅ passwordValidation.js
✅ subjects.js
✅ tokenHelper.js

### Overall: 50%+ of Frontend Codebase Documented

---

## 🚀 Quick Start for New Developers

### Day 1: Understand Architecture
1. Read `DOCUMENTATION.md` - Architecture overview
2. Check `FRONTEND_DOCS_README.md` - Quick guide
3. Review `DOCUMENTATION_EXAMPLES.md` - Code patterns

### Day 2: Explore Authentication
1. Read `Login.jsx` comments
2. Study `AuthContext.jsx` token flow
3. Understand `apiClient.js` token refresh

### Day 3: Work on Features
1. Find relevant file in Quick Reference above
2. Read comprehensive comments
3. Check DOCUMENTATION_EXAMPLES.md for patterns
4. Follow established code style

---

## 📝 Comment Quality Standards

All documentation follows professional patterns:

**Purpose Section**
- Explains what the code does
- Why it's important
- When it's used

**Details Section**
- Input parameters
- Expected output
- Flow/process
- Error handling

**Usage Section**
- Real code examples
- Where it's used in the app
- Best practices

---

## 🔗 File Structure

```
EduZone/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx ✅
│   │   │   ├── DonorRegistration.jsx ✅
│   │   │   ├── ForgotPassword.jsx ✅
│   │   │   ├── ResetPassword.jsx ✅
│   │   │   ├── ChangePassword.jsx ✅
│   │   │   ├── Home.jsx ✅
│   │   │   ├── PublicResources.jsx ✅
│   │   │   ├── NotFound.jsx ✅
│   │   │   ├── Unauthorized.jsx ✅
│   │   ├── services/
│   │   │   ├── apiClient.js ✅
│   │   │   ├── axiosConfig.js ✅
│   │   │   ├── authService.js ✅
│   │   │   ├── schoolService.js ⏳
│   │   ├── context/
│   │   │   ├── AuthContext.jsx ✅
│   │   ├── utils/
│   │   │   ├── passwordValidation.js ✅
│   │   │   ├── subjects.js ✅
│   │   │   ├── tokenHelper.js ✅
│   │   ├── components/
│   │   │   ├── ChangePassword.jsx ✅
│   │   │   ├── ... (pending) ⏳
│   │   ├── routes/
│   │   │   ├── AppRouter.jsx ⏳
│   │   │   ├── ProtectedRoute.jsx ⏳
│
├── FRONTEND_DOCS_README.md ✅
├── DOCUMENTATION.md ✅
├── DOCUMENTATION_SUMMARY.md ✅
├── DOCUMENTATION_EXAMPLES.md ✅
└── PHASE_2_DOCUMENTATION_COMPLETE.md ✅
```

---

## ✅ Status Legend
- ✅ Fully documented with comprehensive comments
- 🔄 Partially documented
- ⏳ Pending documentation (Phase 3)

---

**Last Updated:** Phase 2 Complete
**Total Documented Files:** 17
**Total Comment Blocks:** 220+
**Coverage:** 50%+ of frontend codebase

For detailed information, refer to individual file comments or DOCUMENTATION.md
