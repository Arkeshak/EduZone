# EduZone – Hatton Zonal Education Management System

## Final Year University Project Frontend

A comprehensive multi-role education management system built with React, TypeScript, and modern web technologies.

## 🎯 Project Overview

EduZone is a web-based platform that digitalizes:
- **Welfare Management**: Student welfare request submission and approval workflow
- **Donation Tracking**: Connect donors with students in need
- **Circular Publishing**: Communication from ZEO to schools
- **Resource Sharing**: Educational materials across schools
- **School Reporting**: Monthly performance reports

## 🏗️ Tech Stack

- **React 18.3.1** with Vite
- **TypeScript**
- **React Router DOM 7** - Client-side routing
- **Axios** - API integration
- **Context API** - State management
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **JWT Decode** - Token management

## 📁 Project Structure

```
/src
├── api/                    # API service layers
│   ├── axios.js           # Axios instance with interceptors
│   └── authApi.js         # Authentication API calls
├── components/            # Reusable UI components
│   ├── LoadingSpinner.jsx
│   └── StatusBadge.jsx
├── context/               # React Context providers
│   └── AuthContext.jsx    # Authentication state
├── layouts/               # Page layouts
│   └── DashboardLayout.jsx # Main dashboard layout
├── pages/                 # Page components
│   ├── Home.jsx           # Public landing page
│   ├── Login.jsx          # Login page
│   ├── DonorRegistration.jsx
│   ├── teacher/           # Teacher role pages
│   │   ├── TeacherDashboard.jsx
│   │   ├── SubmitWelfareRequest.jsx
│   │   ├── TrackWelfareRequests.jsx
│   │   ├── UploadResource.jsx
│   │   ├── TeacherCirculars.jsx
│   │   └── TeacherProfile.jsx
│   ├── principal/         # Principal role pages
│   │   ├── PrincipalDashboard.jsx
│   │   ├── ReviewWelfareRequests.jsx
│   │   ├── SubmitReport.jsx
│   │   ├── PrincipalCirculars.jsx
│   │   └── PrincipalProfile.jsx
│   ├── zeo/              # ZEO role pages
│   │   ├── ZEODashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── WelfareApproval.jsx
│   │   ├── DonationManagement.jsx
│   │   ├── PublishCircular.jsx
│   │   ├── ResourceApproval.jsx
│   │   ├── ReportReview.jsx
│   │   └── Analytics.jsx
│   └── donor/            # Donor role pages
│       ├── DonorDashboard.jsx
│       ├── BrowseWelfareRequests.jsx
│       ├── MakeDonation.jsx
│       ├── TrackDonations.jsx
│       └── DonorProfile.jsx
├── routes/               # Routing configuration
│   ├── AppRouter.jsx     # Main router setup
│   └── ProtectedRoute.jsx # Route protection HOC
└── utils/                # Utility functions
    └── tokenHelper.js    # JWT token management
```

## 🔐 User Roles & Access

### 1. Teacher
- Submit welfare requests for students
- Track request statuses
- Upload educational resources
- View circulars from ZEO
- Manage profile

**Test Login**: `teacher@edu.lk` / any password

### 2. Principal
- Review welfare requests from teachers
- Approve or reject requests
- Submit monthly school reports
- View circulars
- Manage profile

**Test Login**: `principal@edu.lk` / any password

### 3. ZEO (Zonal Education Officer)
- Create teacher and principal accounts
- Final welfare approval
- Manage donations
- Publish circulars
- Approve study resources
- Review school reports
- View analytics

**Test Login**: `zeo@edu.lk` / any password

### 4. Donor
- Browse published welfare requests
- Make donations (Cash or In-Kind)
- Track donation history
- Manage profile

**Test Login**: `donor@example.com` / any password

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎨 Features Implemented

### Authentication
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Token expiration handling
- ✅ Automatic redirect on unauthorized access

### Teacher Module
- ✅ Dashboard with statistics
- ✅ Welfare request submission form
- ✅ Request tracking table
- ✅ File upload support
- ✅ Status badges for requests

### Principal Module
- ✅ Dashboard overview
- ✅ Request review interface
- ✅ Monthly report submission
- ✅ Circular viewing

### ZEO Module
- ✅ Comprehensive dashboard
- ✅ User management interface
- ✅ Welfare approval system
- ✅ Donation management
- ✅ Circular publishing

### Donor Module
- ✅ Public registration
- ✅ Dashboard with donation stats
- ✅ Browse available requests
- ✅ Donation tracking

## 🔧 Key Technical Features

### Authentication Flow
1. User logs in with email/password
2. Backend returns JWT token (mocked in demo)
3. Token stored in localStorage
4. Token decoded to extract user role
5. User redirected to role-specific dashboard
6. Token validated on each protected route access

### API Integration
- Centralized Axios instance
- Request interceptor adds auth token
- Response interceptor handles errors
- Automatic 401 redirect to login
- Error message extraction from API responses

### State Management
- Context API for authentication state
- Loading states for async operations
- Error handling with user feedback
- Success notifications with Sonner

### Form Handling
- Client-side validation
- File upload support
- Error display
- Loading states
- Success feedback

## 📝 Workflow Examples

### Welfare Request Workflow
1. **Teacher** submits welfare request → Status: "Pending Principal"
2. **Principal** reviews and approves → Status: "Pending ZEO"  
3. **ZEO** gives final approval → Status: "Published" (visible to donors)
4. **Donor** makes donation → Status: "Funded"

### Resource Sharing Workflow
1. **Teacher** uploads study resource → Status: "Pending ZEO Approval"
2. **ZEO** reviews and approves → Status: "Approved" (available to all)

### School Reporting Workflow
1. **Principal** submits monthly report → Status: "Submitted"
2. **ZEO** reviews report → Can approve or request revision

## 🎯 Backend Integration Notes

To connect to a real backend:

1. Update `VITE_API_BASE_URL` in `.env`
2. Replace mock API calls in pages with actual API calls
3. Remove mock JWT token generation from Login.jsx
4. Implement proper error handling based on backend responses

Expected API endpoints:
```
POST   /api/auth/login
POST   /api/auth/register-donor
GET    /api/auth/me
PUT    /api/auth/change-password

POST   /api/welfare-requests
GET    /api/welfare-requests
PUT    /api/welfare-requests/:id/approve
PUT    /api/welfare-requests/:id/reject

POST   /api/donations
GET    /api/donations

POST   /api/circulars
GET    /api/circulars

POST   /api/reports
GET    /api/reports

POST   /api/users
GET    /api/users
```

## 🔒 Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- CORS configuration needed on backend
- Input validation on both client and server
- File upload size limits
- Rate limiting on API endpoints
- HTTPS required for production

## 📦 Build for Production

```bash
npm run build
```

Output will be in `/dist` directory.

## 🎓 Academic Notes

This is a **final year university project** demonstrating:
- Modern React development practices
- Role-based access control (RBAC)
- Multi-user workflows
- API integration patterns
- Clean code architecture
- Responsive UI design
- Form validation and error handling
- File upload functionality
- State management with Context API
- Protected routing
- JWT authentication flow

## 📄 License

This project is for educational purposes as part of a university final year project.

## 👨‍💻 Development

For questions or issues during development, refer to:
- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Axios: https://axios-http.com
- Tailwind CSS: https://tailwindcss.com

---

**Project**: EduZone – Hatton Zonal Education Management System  
**Type**: Final Year University Project  
**Status**: Frontend Implementation Complete
