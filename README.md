# 🎓 EduZone - Educational Welfare & Management Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-v16%2B-brightgreen.svg)
![React](https://img.shields.io/badge/react-18%2B-61dafb.svg)

> **EduZone** is a robust, multi-role digital platform designed to streamline welfare requests, donation transparency, circular distribution, and educational resource management within a school zone. It connects educators, administrations, and generous donors to ensure students receive the financial and material support they need effectively and transparently.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Business Workflows](#business-workflows)
- [Authentication & Authorization](#authentication--authorization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

### Problem Statement
Traditional educational support systems suffer from:
- **Lack of transparency** - Donors skeptical about fund utilization
- **Slow bureaucratic pipelines** - Weeks to process student assistance requests
- **Fragmentation** - No unified platform for teachers, principals, ZEOs, and donors
- **No traceability** - Difficult to track donation impact

### The Solution
EduZone solves these challenges by bringing four key system actors onto a single relational platform:

1. **Teachers** - Submit verified student needs
2. **Principals** - Verify and endorse requests at school level
3. **ZEO (Zonal Education Officer)** - Final auditors, verify donations, execute transfers
4. **Donors** - Transparently fund requests and upload receipt proofs

### Real-World Use Case
A teacher identifies a student who cannot afford school fees. Instead of multiple handwritten letters and lost applications:
1. Teacher submits a welfare request with supporting documents
2. Principal reviews and approves at school level
3. ZEO audits and publishes request for public funding
4. Donors browse and pledge funds with payment proof
5. ZEO verifies receipt and transfers funds to school account
6. Student receives assistance - complete transparency for all parties

---

## ✨ Key Features

### 🎯 Role-Based Dashboards
- **ZEO Dashboard**: User management, request approval, donation verification, fund transfers, circular distribution
- **Principal Dashboard**: Request review, staff management, monthly reporting, circular receipt
- **Teacher Dashboard**: Create welfare requests, upload resources, view circulars, manage students
- **Donor Dashboard**: Browse requests, pledge donations, track impact, upload payment proof

### 📋 Welfare Request Workflow
- Structured pipeline: SUBMITTED → PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED → PARTIALLY_FUNDED → FULLY_FUNDED → TRANSFERRED
- Document upload support (PDFs, images)
- Priority levels (LOW, MEDIUM, HIGH)
- Status tracking and notifications
- Unique reference codes for tracking

### 💰 Transparent Donation Engine
- Secure donor portal for pledging funds
- Multiple payment methods (BANK_TRANSFER, ONLINE)
- Receipt verification workflow
- Strict bank receipt validation before fund release
- Direct transfers to school bank accounts
- Anonymous donation option

### 📢 Circulars & Communications
- Centralized announcement distribution from ZEOs
- File attachments (PDFs with important directives)
- Role-based recipient targeting
- Acknowledgment tracking system
- Instant notifications to recipients

### 📚 Resource Hub
- Collaborative educational material sharing
- Subject and grade-level categorization
- Public resource browsing (teachers, students, donors)
- Document upload and download support
- Resource metadata tracking (uploader, subject, grade)

### 📊 Monitoring & Reporting
- Monthly school performance reports
- Dashboard analytics and statistics
- Welfare request status tracking
- Donation trend analysis
- Fund utilization reports

### 🔐 Deep Security
- **JWT-based authentication** with auto-refresh mechanisms
- **Role-based access control** for all endpoints
- **Input sanitization** (XSS prevention)
- **Password hashing** with bcryptjs (salted bcrypt)
- **Rate limiting** on sensitive endpoints (15 requests/15min for auth)
- **CORS configuration** for cross-origin protection
- **Helmet security headers** for HTTP protection
- **Email verification** for account activation
- **Password reset** with expiring tokens

---

## 🏗️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React.js** | UI framework with hooks | 18+ |
| **Vite** | Lightning-fast build tool | Latest |
| **React Router v6** | Client-side routing with nested routes | 6+ |
| **Tailwind CSS** | Utility-first CSS framework | Latest |
| **shadcn/ui** | Accessible, customizable components | Latest |
| **Radix UI** | Headless component primitives | Latest |
| **Axios** | HTTP client with interceptors | ^1.13 |
| **JWT-Decode** | Decode JWT tokens client-side | ^4.0 |
| **Lucide React** | Beautiful icon library | 0.487+ |
| **Sonner** | Toast notifications system | Latest |
| **html2canvas** | Convert HTML to canvas/image | ^1.4 |
| **jsPDF** | PDF generation client-side | ^4.2 |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | v16+ |
| **Express.js** | Web framework | ^5.2 |
| **Sequelize** | ORM for relational databases | ^6.37 |
| **MySQL2** | MySQL driver for Node.js | ^3.16 |
| **bcryptjs** | Password hashing | ^3.0 |
| **jsonwebtoken** | JWT token generation/verification | ^9.0 |
| **Helmet** | Security headers middleware | ^8.1 |
| **express-rate-limit** | Rate limiting middleware | ^8.3 |
| **express-validator** | Input validation | ^7.0 |
| **Multer** | File upload handling | ^2.0 |
| **Nodemailer** | Email sending | ^7.0 |
| **XSS** | Input sanitization | ^1.0 |
| **PDFKit** | PDF generation server-side | ^0.18 |
| **CORS** | Cross-origin resource sharing | ^2.8 |

### Database
| Technology | Purpose |
|-----------|---------|
| **MySQL** | Production relational database |
| **PostgreSQL** | Alternative relational database |
| **SQLite** | In-memory testing database |

### Development & Testing
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Jest** | Testing framework | ^30.3 |
| **Supertest** | HTTP assertion library | ^7.2 |
| **cross-env** | Cross-platform env variables | ^10.1 |
| **dotenv** | Environment variable loading | ^17.2 |

---

## 🔗 System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Teacher     │  │  Principal   │  │  ZEO Admin   │            │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│        ↓                   ↓                   ↓                   │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  React Router v6 (Protected Routes)                    │      │
│  │  Axios HTTP Client + JWT Interceptors                  │      │
│  │  Sonner Toast Notifications                            │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTPS / JSON
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Express.js)                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Middleware Stack:                                     │     │
│  │  • Helmet (Security Headers)                           │     │
│  │  • CORS (Cross-Origin)                                 │     │
│  │  • Rate Limiting (Auth: 10/15min, General: 100/15min)  │     │
│  │  • Body Parser (JSON)                                  │     │
│  │  • Multer (File Uploads)                               │     │
│  │  • Express Validator (Input Validation)                │     │
│  │  • Sanitization (XSS Prevention)                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                            ↓                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Route Controllers:                                    │     │
│  │  • authController (JWT, Password Reset)                │     │
│  │  • welfareController (Request Management)              │     │
│  │  • donationController (Fund Management)                │     │
│  │  • circularController (Announcements)                  │     │
│  │  • resourceController (File Sharing)                   │     │
│  │  • schoolController (School Management)                │     │
│  │  • reportController (Monthly Reports)                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                            ↓                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Sequelize ORM Layer:                                  │     │
│  │  • Transaction Management                              │     │
│  │  • Model Associations                                  │     │
│  │  • Validation & Constraints                            │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                            ↓ SQL Queries
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MySQL/PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Users       │  │  Welfare     │  │  Donations   │            │
│  │  Schools     │  │  Requests    │  │  Transfers   │            │
│  │  Teachers    │  │  Documents   │  │  Circulars   │            │
│  │  Principals  │  │  Resources   │  │  Reports     │            │
│  │  Donors      │  │  Timestamps  │  │  Analytics   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Example (Welfare Request to Fund Transfer)

```
Teacher
   ↓
[POST /api/welfare] - Create welfare request with document
   ↓ (Multer saves file)
WelfareController.createRequest()
   ↓ (Validation, Sanitization)
Sequelize Transaction Start
   ↓
Create WelfareRequest (status: SUBMITTED)
   ↓ (Create WelfareRequestDocument)
Database INSERT
   ↓
Transaction Commit
   ↓ (Email Notification to Principal)
Response 201 { id, referenceCode, status }

   ↓ ↓ ↓ (Days later) ↓ ↓ ↓

Principal
   ↓
[PATCH /api/welfare/:id/status] - Approve request
   ↓ (JWT verified, role: PRINCIPAL)
WelfareController.updateStatus()
   ↓ (Status: PRINCIPAL_APPROVED)
Database UPDATE
   ↓ (Email to ZEO)
Response 200 { status: PRINCIPAL_APPROVED }

   ↓ ↓ ↓ (ZEO reviews) ↓ ↓ ↓

ZEO Admin
   ↓
[PATCH /api/welfare/:id/status] - Approve & Publish
   ↓ (Role: ZEO)
WelfareController.updateStatus()
   ↓ (Status: ZEO_APPROVED → PUBLISHED)
Database UPDATE
   ↓
Response 200 { status: PUBLISHED }
   ↓ (Now visible to public donors)

Donor
   ↓
[GET /api/welfare/published] - Browse requests
   ↓
[POST /api/donation] - Submit donation
   ↓ (Multer saves receipt)
DonationController.createDonation()
   ↓
Sequelize Transaction Start
   ↓
Create Donation (status: PENDING)
   ↓
Database INSERT
   ↓
Transaction Commit
   ↓
Response 201 { id, amount, status: PENDING }

   ↓ ↓ ↓ (ZEO verifies receipt) ↓ ↓ ↓

ZEO Admin
   ↓
[PATCH /api/donation/:id/verify] - Verify receipt
   ↓
DonationController.verifyDonation()
   ↓
Sequelize Transaction Start
   ↓
Update Donation (status: VERIFIED)
   ↓
Recalculate WelfareRequest funding total
   ↓
IF total >= required: status = FULLY_FUNDED
   ↓
Transaction Commit
   ↓
Response 200 { donation: VERIFIED, welfare: FULLY_FUNDED }

   ↓ ↓ ↓ (Funds transferred) ↓ ↓ ↓

ZEO Admin
   ↓
[POST /api/transfer] - Record bank transfer
   ↓
TransferController.createTransfer()
   ↓
Sequelize Transaction Start
   ↓
Create Transfer record
   ↓
Update WelfareRequest (status: TRANSFERRED)
   ↓
Transaction Commit
   ↓
✅ COMPLETE: Student receives assistance!
```

---

## 👥 User Roles & Permissions

### Role Capabilities Matrix

| Feature | Teacher | Principal | ZEO Admin | Donor |
|---------|---------|-----------|-----------|-------|
| **Self-Registration** | ❌ | ❌ | ❌ | ✅ |
| **Account Creation (ZEO)** | ❌ | ❌ | ✅ | ❌ |
| **Create Welfare Request** | ✅ | ❌ | ❌ | ❌ |
| **Approve Request (School)** | ❌ | ✅ | ❌ | ❌ |
| **Approve & Publish Request** | ❌ | ❌ | ✅ | ❌ |
| **View Published Requests** | ✅ | ✅ | ✅ | ✅ |
| **Submit Donation** | ❌ | ❌ | ❌ | ✅ |
| **Upload Receipt** | ❌ | ❌ | ❌ | ✅ |
| **Verify Donations** | ❌ | ❌ | ✅ | ❌ |
| **Transfer Funds** | ❌ | ❌ | ✅ | ❌ |
| **Upload Resources** | ✅ | ❌ | ❌ | ❌ |
| **Download Resources** | ✅ | ❌ | ❌ | ✅ |
| **Submit Monthly Report** | ❌ | ✅ | ❌ | ❌ |
| **Review Reports** | ❌ | ❌ | ✅ | ❌ |
| **Publish Circulars** | ❌ | ❌ | ✅ | ❌ |
| **Read Circulars** | ✅ | ✅ | ❌ | ❌ |
| **Manage Users** | ❌ | ❌ | ✅ | ❌ |

### Role Descriptions

#### 🎓 ZEO (Zonal Education Officer)
The top-level administrator with complete system oversight.
- Create user accounts for principals, teachers
- Approve welfare requests after principal endorsement
- Verify donation receipts against bank statements
- Execute fund transfers to school accounts
- Publish official circulars with attachments
- Review monthly school reports
- Generate system analytics and reports
- Delete/suspend user accounts

#### 🏫 Principal
School administrator responsible for request vetting and reporting.
- Review welfare requests from teachers
- Approve/reject requests at school level
- Submit monthly performance reports
- View assigned circulars
- Manage teacher and student profiles

#### 👨‍🏫 Teacher
Educator identifying student needs and sharing resources.
- Create welfare requests for needy students
- Upload supporting documents for requests
- Upload educational resources (PDFs, documents)
- View shared resources from other teachers
- Receive circulars from ZEO
- Manage student profiles

#### 💳 Donor
Individuals/organizations providing financial support.
- Browse published welfare requests
- Submit donations with payment methods
- Upload bank transfer receipts
- Track donation status and impact
- Download educational resources
- View donation history

---

## 📁 Project Structure

```
EduZone/
│
├── 📄 package.json                    # Root project metadata
├── 📄 README.md                       # This file
├── 📄 project_flow_and_explanation.md # Detailed architecture documentation
├── 📄 EduZone_ER_Final.drawio        # Database ER diagram
├── 📄 Eduzone.txt                     # Project notes
├── 📄 MySql PW.txt                    # Database credentials (⚠️ don't commit)
│
├── 📁 backend/                        # Express.js API Server
│   ├── 📄 server.js                   # Main server entry point
│   ├── 📄 package.json                # Backend dependencies
│   ├── 📄 jest.config.js              # Jest testing configuration
│   │
│   ├── 📁 config/                     # Configuration files
│   │   ├── 📄 db.js                   # Sequelize database connection
│   │   ├── 📄 constants.js            # App constants (JWT, rate limits)
│   │   └── 📄 config.json             # Additional configuration
│   │
│   ├── 📁 models/                     # Sequelize ORM Models (20+ models)
│   │   ├── 📄 User.js                 # Base user account model
│   │   ├── 📄 Principal.js            # Principal profile (1:1 with User)
│   │   ├── 📄 Teacher.js              # Teacher profile (1:1 with User)
│   │   ├── 📄 Donor.js                # Donor profile (1:1 with User)
│   │   ├── 📄 School.js               # School institution model
│   │   ├── 📄 Student.js              # Student profile (linked to School)
│   │   ├── 📄 Subject.js              # Subject definitions (Math, English, etc)
│   │   ├── 📄 TeacherSubject.js       # Teacher subject expertise (M:N)
│   │   ├── 📄 WelfareRequest.js       # Student welfare request (core model)
│   │   ├── 📄 WelfareRequestDocument.js # Supporting documents for requests
│   │   ├── 📄 WelfareType.js          # Welfare categories (Fees, Medical, etc)
│   │   ├── 📄 Donation.js             # Donor contributions
│   │   ├── 📄 Transfer.js             # Fund transfers to schools
│   │   ├── 📄 Circular.js             # Official announcements
│   │   ├── 📄 CircularAttachment.js   # Circular PDF attachments
│   │   ├── 📄 CircularRecipient.js    # Circular recipient tracking
│   │   ├── 📄 Resource.js             # Shared educational materials
│   │   ├── 📄 MonthlyReport.js        # School monthly performance reports
│   │   ├── 📄 Notification.js         # System notifications
│   │   ├── 📄 PasswordReset.js        # Password reset tokens
│   │   ├── 📄 Event.js                # System event log
│   │   ├── 📄 WelfareApproval.js      # Approval workflow states
│   │   ├── 📄 WelfareHistory.js       # Request status change history
│   │   ├── 📄 TransferRequest.js      # Transfer request process
│   │   └── 📄 index.js                # Model associations & sequelize export
│   │
│   ├── 📁 controllers/                # Business logic handlers (8 controllers)
│   │   ├── 📄 authController.js       # Authentication, token generation, registration
│   │   ├── 📄 welfareController.js    # Welfare request CRUD & workflow
│   │   ├── 📄 donationController.js   # Donation processing & verification
│   │   ├── 📄 circularController.js   # Circular creation & distribution
│   │   ├── 📄 resourceController.js   # Resource upload & sharing
│   │   ├── 📄 schoolController.js     # School management
│   │   ├── 📄 reportController.js     # Monthly report handling
│   │   ├── 📄 transferController.js   # Fund transfer processing
│   │   └── 📄 welfareTypeController.js # Welfare category management
│   │
│   ├── 📁 routes/                     # API endpoint definitions (9 routers)
│   │   ├── 📄 authRoutes.js           # /api/auth/* endpoints
│   │   ├── 📄 welfareRoutes.js        # /api/welfare/* endpoints
│   │   ├── 📄 donationRoutes.js       # /api/donation/* endpoints
│   │   ├── 📄 circularRoutes.js       # /api/circular/* endpoints
│   │   ├── 📄 resourceRoutes.js       # /api/resource/* endpoints
│   │   ├── 📄 schoolRoutes.js         # /api/school/* endpoints
│   │   ├── 📄 reportRoutes.js         # /api/report/* endpoints
│   │   ├── 📄 transferRoutes.js       # /api/transfer/* endpoints
│   │   └── 📄 welfareTypeRoutes.js    # /api/welfare-type/* endpoints
│   │
│   ├── 📁 middleware/                 # Express middleware functions (5 middleware)
│   │   ├── 📄 authMiddleware.js       # JWT verification & role authorization
│   │   ├── 📄 errorHandler.js         # Global error handling & async wrapper
│   │   ├── 📄 validation.js           # express-validator rules & validation chains
│   │   ├── 📄 sanitization.js         # XSS prevention input sanitization
│   │   └── 📄 uploadMiddleware.js     # Multer file upload configuration
│   │
│   ├── 📁 utils/                      # Utility functions
│   │   └── 📄 sendEmail.js            # Nodemailer email sending service
│   │
│   ├── 📁 seeders/                    # Database seeding scripts
│   │   ├── 📄 InitialSeeder.js        # Create initial test data
│   │   └── 📄 LegacySeeder.js         # Legacy data migration
│   │
│   ├── 📁 scripts/                    # One-off utility scripts (7 scripts)
│   │   ├── 📄 seedFullWorkflow.js     # Seed complete workflow test data
│   │   ├── 📄 cleanupAndBackfill.js   # Database cleanup and migration
│   │   ├── 📄 fixTeacherAndResources.js # Data fix script
│   │   ├── 📄 sync_user.js            # User synchronization
│   │   ├── 📄 fix_db.js               # Database fixes
│   │   ├── 📄 checkDb.js              # Database validation
│   │   └── 📄 verifyFlow.js           # Workflow verification
│   │
│   ├── 📁 scratch/                    # Development scratch files
│   │   ├── 📄 check_user.js
│   │   ├── 📄 reset_password.js
│   │   ├── 📄 test_db.js
│   │   └── 📄 update_enum.js
│   │
│   ├── 📁 tests/                      # Jest test suites (8 test files)
│   │   ├── 📄 setup.js                # Test environment setup
│   │   └── 📁 api/
│   │       ├── 📄 auth.test.js        # Authentication endpoint tests
│   │       ├── 📄 welfare.test.js     # Welfare request tests
│   │       ├── 📄 donations.test.js   # Donation processing tests
│   │       ├── 📄 circulars.test.js   # Circular distribution tests
│   │       ├── 📄 resources.test.js   # Resource sharing tests
│   │       ├── 📄 schools.test.js     # School management tests
│   │       ├── 📄 transfers.test.js   # Transfer workflow tests
│   │       └── 📄 reports.test.js     # Report submission tests
│   │
│   ├── 📁 uploads/                    # Uploaded files storage
│   │   ├── circulars/                 # Circular attachments
│   │   ├── welfare/                   # Welfare request documents
│   │   ├── donations/                 # Donation receipts
│   │   ├── resources/                 # Educational materials
│   │   └── profiles/                  # Profile pictures
│   │
│   ├── 📄 seed_error_output.txt       # Seeding error logs
│   ├── 📄 .env.example                # Environment variables template
│   └── 📄 .gitignore                  # Git ignore rules
│
├── 📁 frontend/                       # React.js Vite Application
│   ├── 📄 package.json                # Frontend dependencies
│   ├── 📄 vite.config.js              # Vite build configuration
│   ├── 📄 postcss.config.mjs          # PostCSS/Tailwind config
│   ├── 📄 index.html                  # HTML entry point
│   │
│   ├── 📁 src/                        # React source code
│   │   ├── 📄 main.jsx                # React DOM render entry
│   │   ├── 📄 App.jsx                 # Root app component with router
│   │   │
│   │   ├── 📁 routes/                 # React Router configuration
│   │   │   ├── 📄 AppRouter.jsx       # Route definitions with role guards
│   │   │   └── 📄 ProtectedRoute.jsx  # Protected route wrapper component
│   │   │
│   │   ├── 📁 layouts/                # Layout components
│   │   │   ├── 📄 DashboardLayout.jsx # Main dashboard layout with sidebar
│   │   │   └── 📄 AuthLayout.jsx      # Authentication layout
│   │   │
│   │   ├── 📁 pages/                  # Page components (role-specific)
│   │   │   ├── 📄 Home.jsx            # Landing page
│   │   │   ├── 📄 Login.jsx           # Login page
│   │   │   ├── 📄 DonorRegistration.jsx # Donor signup
│   │   │   ├── 📄 ForgotPassword.jsx  # Password recovery
│   │   │   ├── 📄 ResetPassword.jsx   # Password reset form
│   │   │   ├── 📄 ActivateAccount.jsx # Email verification
│   │   │   ├── 📄 Unauthorized.jsx    # 403 error page
│   │   │   ├── 📄 NotFound.jsx        # 404 error page
│   │   │   ├── 📄 PublicResources.jsx # Public resource browsing
│   │   │   │
│   │   │   ├── 📁 teacher/            # Teacher dashboard pages
│   │   │   │   ├── 📄 Dashboard.jsx
│   │   │   │   ├── 📄 CreateRequest.jsx
│   │   │   │   ├── 📄 MyRequests.jsx
│   │   │   │   ├── 📄 UploadResource.jsx
│   │   │   │   └── 📄 ManageStudents.jsx
│   │   │   │
│   │   │   ├── 📁 principal/          # Principal dashboard pages
│   │   │   │   ├── 📄 Dashboard.jsx
│   │   │   │   ├── 📄 ReviewRequests.jsx
│   │   │   │   ├── 📄 MonthlyReporting.jsx
│   │   │   │   └── 📄 ViewCirculars.jsx
│   │   │   │
│   │   │   ├── 📁 zeo/                # ZEO admin pages
│   │   │   │   ├── 📄 Dashboard.jsx
│   │   │   │   ├── 📄 ApproveRequests.jsx
│   │   │   │   ├── 📄 VerifyDonations.jsx
│   │   │   │   ├── 📄 PublishCircular.jsx
│   │   │   │   ├── 📄 ManageUsers.jsx
│   │   │   │   └── 📄 SystemAnalytics.jsx
│   │   │   │
│   │   │   └── 📁 donor/              # Donor portal pages
│   │   │       ├── 📄 Dashboard.jsx
│   │   │       ├── 📄 BrowseRequests.jsx
│   │   │       ├── 📄 MakeDonation.jsx
│   │   │       ├── 📄 DonationHistory.jsx
│   │   │       └── 📄 MyImpact.jsx
│   │   │
│   │   ├── 📁 components/             # Reusable UI components
│   │   │   ├── 📄 FormInput.jsx       # Form input wrapper
│   │   │   ├── 📄 FileUploader.jsx    # File upload component
│   │   │   ├── 📄 StatusBadge.jsx     # Status display badge
│   │   │   ├── 📄 LoadingSpinner.jsx  # Loading indicator
│   │   │   ├── 📄 ImageWithFallback.jsx # Image with fallback
│   │   │   ├── 📄 ProfilePictureUpload.jsx # Profile image uploader
│   │   │   ├── 📄 ChangePassword.jsx  # Password change form
│   │   │   │
│   │   │   └── 📁 ui/                 # shadcn/ui components
│   │   │       ├── 📄 button.jsx
│   │   │       ├── 📄 input.jsx
│   │   │       ├── 📄 dialog.jsx
│   │   │       ├── 📄 select.jsx
│   │   │       ├── 📄 tabs.jsx
│   │   │       ├── 📄 dropdown-menu.jsx
│   │   │       ├── 📄 alert.jsx
│   │   │       ├── 📄 progress.jsx
│   │   │       └── ... (20+ shadcn/ui components)
│   │   │
│   │   ├── 📁 context/                # React Context providers
│   │   │   └── 📄 AuthContext.jsx     # User auth & role context
│   │   │
│   │   ├── 📁 services/               # API service utilities
│   │   │   ├── 📄 apiClient.js        # Axios instance + JWT interceptors
│   │   │   ├── 📄 authService.js      # Auth API calls
│   │   │   ├── 📄 welfareService.js   # Welfare API calls
│   │   │   ├── 📄 donationService.js  # Donation API calls
│   │   │   ├── 📄 circularService.js  # Circular API calls
│   │   │   ├── 📄 resourceService.js  # Resource API calls
│   │   │   └── 📄 schoolService.js    # School API calls
│   │   │
│   │   ├── 📁 utils/                  # Utility functions
│   │   │   ├── 📄 formatters.js       # Date, currency formatting
│   │   │   ├── 📄 validators.js       # Form validation rules
│   │   │   └── 📄 helpers.js          # General helper functions
│   │   │
│   │   ├── 📁 styles/                 # Global CSS
│   │   │   ├── 📄 globals.css         # Global styles & Tailwind imports
│   │   │   └── 📄 animations.css      # Custom animations
│   │   │
│   │   └── 📁 assets/                 # Static assets
│   │       ├── logo.png
│   │       ├── favicon.ico
│   │       └── ... (images, icons)
│   │
│   ├── 📄 .env.example                # Environment template
│   ├── 📄 .gitignore                  # Git ignore rules
│   └── 📄 package-lock.json           # Locked dependency versions
│
├── 📁 scratch/                        # Scratch development files
│   ├── 📄 check_attachments.js
│   ├── 📄 check_db.js
│   ├── 📄 debug_circulars.js
│   ├── 📄 seed_test_circular.js
│   └── 📄 test_me.js
│
└── 📄 .gitignore                      # Root git ignore rules
```

### Directory Purpose Summary

| Folder | Purpose |
|--------|---------|
| `backend/config` | Database connection, application constants |
| `backend/models` | Sequelize ORM model definitions |
| `backend/controllers` | Business logic and request handlers |
| `backend/routes` | API endpoint definitions and routing |
| `backend/middleware` | Authentication, validation, error handling |
| `backend/utils` | Email, PDF generation, helper functions |
| `backend/tests` | Jest test suites for API endpoints |
| `backend/uploads` | File storage for documents, receipts, resources |
| `frontend/routes` | React Router configuration and protected routes |
| `frontend/pages` | Page components organized by role |
| `frontend/components` | Reusable UI components |
| `frontend/services` | Axios API client and service methods |
| `frontend/context` | React Context for auth state management |
| `frontend/utils` | Formatters, validators, helpers |

---

## 🗄️ Database Schema

### Core Entity-Relationship Diagram

```
┌─────────────┐
│    Users    │ ◄────────── Role: ZEO, PRINCIPAL, TEACHER, DONOR
│─────────────│
│ id (PK)     │
│ email (UK)  │────┐
│ password    │    │
│ role        │    │
│ verified    │    │
└─────────────┘    │
       △           │
       │ 1:1       │
       └───────────┼─────────────────────────────┐
           ┌───────┴─────────────────────────────┴────────┐
           │                                               │
      ┌────▼────┐  ┌──────────┐  ┌──────────┐  ┌────▼──────┐
      │Principal │  │ Teacher  │  │  Donor   │  │   Event   │
      └──────────┘  └──────────┘  └──────────┘  └───────────┘
           │              │
           │ 1:N          │ 1:N
           │              │
      ┌────▼──────────────▼──────┐
      │      Schools             │
      │──────────────────────────│
      │ id (PK)                  │
      │ name                     │
      │ bank_account_number      │
      └──────────────────────────┘
           △
           │ 1:N
           │
      ┌────┴──────────┐
      │    Students   │
      │───────────────│
      │ id (PK)       │
      │ school_id (FK)│
      └───────────────┘
           △
           │ 1:N
           │
    ┌──────┴──────────────────────────────────┐
    │    WelfareRequest (Core Entity)         │
    │──────────────────────────────────────────│
    │ id (PK)                                  │
    │ student_id (FK) ─ Who needs help        │
    │ teacher_id (FK) ─ Who submitted         │
    │ school_id (FK)  ─ Which school         │
    │ category        ─ Type (Fees, Medical) │
    │ amount_required ─ How much needed      │
    │ status          ─ State machine        │
    │ created_at      ─ Timestamp            │
    └──────────────────────────────────────────┘
           △          △
           │ 1:N      │ 1:N
           │          │
      ┌────┴──┐  ┌───┴──────────┐
      │Document│  │ Donations    │
      └────────┘  │──────────────│
                  │ id (PK)      │
                  │ donor_id(FK) │
                  │ amount       │
                  │ status       │
                  │ receipt_ref  │
                  └──────────────┘
                         │
                         │ 1:N
                         │
                    ┌────▼─────┐
                    │ Transfers │
                    │───────────│
                    │ id (PK)   │
                    │ amount    │
                    │ school_id │
                    └───────────┘

Other Key Entities:
┌──────────────────┐  ┌─────────────────┐  ┌─────────────┐
│ Resource         │  │ Circular        │  │ MonthlyReport
│──────────────────│  │─────────────────│  │─────────────│
│ id               │  │ id              │  │ id          │
│ teacher_id (FK)  │  │ publisher_id    │  │ principal_id│
│ subject_id (FK)  │  │ content         │  │ school_id   │
│ file_path        │  │ attachment_path │  │ metrics     │
│ upload_date      │  │ created_at      │  │ submitted   │
└──────────────────┘  └─────────────────┘  └─────────────┘
```

### Key Models & Relationships

#### 1. **Users** (Core Authentication)
- **Fields**: id, fullName, email, passwordHash, role, isVerified, isActive, refreshToken, profilePicture
- **Relationships**: 1:1 with Principal/Teacher/Donor profiles
- **Indexes**: email (unique), role, createdAt

#### 2. **Principal** (1:1 → User, N:1 → School)
- **Fields**: id, userId, schoolId
- **Relationships**: One principal per school (typically)
- **Use**: Approve welfare requests from their school

#### 3. **Teacher** (1:1 → User, N:1 → School)
- **Fields**: id, userId, schoolId, qualifications
- **Relationships**: Many teachers per school
- **Use**: Submit welfare requests, upload resources

#### 4. **Donor** (1:1 → User)
- **Fields**: id, userId, organizationName, taxNumber
- **Relationships**: One donor profile per user
- **Use**: Submit donations

#### 5. **Student** (N:1 → School)
- **Fields**: id, schoolId, fullName, grade, needCategory
- **Relationships**: Many students per school
- **Use**: Beneficiary of welfare requests

#### 6. **WelfareRequest** (Core - connects Student, Teacher, Donations)
- **Fields**: id, studentId, teacherId, schoolId, category, description, amountRequired, status, priority
- **Status States**: SUBMITTED → PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED → PARTIALLY_FUNDED → FULLY_FUNDED → TRANSFERRED
- **Relationships**: N:1 with Student, Teacher; 1:N with Donations, Documents
- **Indexes**: status, schoolId, teacherId, studentId, createdAt

#### 7. **Donation** (Core - connects Donor to WelfareRequest)
- **Fields**: id, donorId, welfareRequestId, amount, paymentMethod, status (PENDING/VERIFIED/REJECTED), receiptReference
- **Relationships**: N:1 with Donor, WelfareRequest, School
- **Use**: Track fund contributions

#### 8. **Transfer** (Records bank transfers)
- **Fields**: id, welfareRequestId, amount, schoolId, transferDate, referenceNumber
- **Relationships**: N:1 with WelfareRequest, School
- **Use**: Complete the funding cycle

#### 9. **Circular** (Official announcements)
- **Fields**: id, publisherId, title, content, createdAt
- **Relationships**: 1:N with CircularAttachment, CircularRecipient
- **Use**: Broadcast official notices

#### 10. **Resource** (Educational materials)
- **Fields**: id, teacherId, subjectId, title, description, filePath, gradeLevel
- **Relationships**: N:1 with Teacher, Subject
- **Use**: Collaborative learning materials

#### 11. **MonthlyReport** (School performance)
- **Fields**: id, schoolId, principalId, month, year, metrics (JSON), submittedAt
- **Relationships**: N:1 with School, Principal
- **Use**: Track school progress

### Database Relationships Summary

```
User (1) ──────── (N) WelfareRequest (via teacherId)
User (1) ──────── (N) Donation (via donorId)
User (1) ──────── (1) Principal/Teacher/Donor
Principal (1) ─── (N) School ← (This is simplified; typically 1 principal per school)
Teacher (N) ───── (1) School
Student (N) ───── (1) School
Student (1) ───── (N) WelfareRequest
WelfareRequest (1) ── (N) Donation
WelfareRequest (1) ── (N) WelfareRequestDocument
Teacher (N) ───── (1) Subject (via TeacherSubject junction)
Subject (1) ───── (N) Resource
School (1) ────── (N) Resource (via Resource.schoolId)
Circular (1) ───── (N) CircularRecipient
Circular (1) ───── (N) CircularAttachment
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### `POST /api/auth/register/donor`
Register a new donor account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "donor@example.com",
  "password": "SecurePass123!",
  "phone": "9876543210",
  "address": "123 Main Street",
  "organizationName": "Help Foundation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Donor registered successfully. Check email for verification code.",
  "user": {
    "id": 1,
    "email": "donor@example.com",
    "role": "DONOR",
    "isVerified": false
  }
}
```

#### `POST /api/auth/verify`
Verify email with verification code.

**Request Body:**
```json
{
  "email": "donor@example.com",
  "verificationCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "isVerified": true
}
```

#### `POST /api/auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "donor@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "donor@example.com",
    "role": "DONOR",
    "profilePicture": null
  }
}
```

#### `POST /api/auth/refresh`
Get new access token using refresh token (sent as HTTP-only cookie).

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/logout`
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### `POST /api/auth/forgotpassword`
Request password reset email.

**Request Body:**
```json
{
  "email": "donor@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

#### `PUT /api/auth/resetpassword/:resetToken`
Set new password with reset token from email.

**Request Body:**
```json
{
  "password": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Welfare Request Endpoints

#### `POST /api/welfare`
Create a new welfare request (Teachers only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request (multipart/form-data):**
```
- studentId: 5
- category: FEES
- description: Student unable to pay tuition
- amountRequired: 5000.00
- priority: HIGH
- supportingDocument: <file>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Welfare request created successfully",
  "request": {
    "id": 12,
    "referenceCode": "WR-2024-001",
    "studentId": 5,
    "category": "FEES",
    "amountRequired": 5000.00,
    "status": "SUBMITTED",
    "priority": "HIGH",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### `GET /api/welfare/published`
Get published welfare requests (public).

**Query Parameters:**
```
- page: 1 (default)
- limit: 50 (default, max 500)
- status: PUBLISHED
- category: FEES
- priority: HIGH
```

**Response (200):**
```json
{
  "success": true,
  "requests": [
    {
      "id": 12,
      "referenceCode": "WR-2024-001",
      "studentName": "Raj Kumar",
      "category": "FEES",
      "amountRequired": 5000.00,
      "amountRaised": 2000.00,
      "status": "PARTIALLY_FUNDED",
      "school": {
        "id": 3,
        "name": "St. Mary's School"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

#### `PATCH /api/welfare/:id/status`
Update welfare request status (Principal/ZEO only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "status": "PRINCIPAL_APPROVED",
  "notes": "Verified with principal - all documents in order"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request status updated successfully",
  "request": {
    "id": 12,
    "status": "PRINCIPAL_APPROVED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### `GET /api/welfare`
Get welfare requests based on role.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "requests": [
    {
      "id": 12,
      "referenceCode": "WR-2024-001",
      "student": { "id": 5, "fullName": "Raj Kumar" },
      "status": "PRINCIPAL_APPROVED",
      "amountRequired": 5000.00,
      "amountRaised": 0.00
    }
  ]
}
```

### Donation Endpoints

#### `POST /api/donation`
Submit a donation to a welfare request.

**Headers:** `Authorization: Bearer <accessToken>`

**Request (multipart/form-data):**
```
- welfareRequestId: 12
- amount: 2000.00
- paymentMethod: BANK_TRANSFER
- receipt: <file>
- isAnonymous: false
```

**Response (201):**
```json
{
  "success": true,
  "message": "Donation submitted for verification",
  "donation": {
    "id": 45,
    "amount": 2000.00,
    "status": "PENDING",
    "paymentMethod": "BANK_TRANSFER",
    "createdAt": "2024-01-15T14:20:00Z"
  }
}
```

#### `PATCH /api/donation/:id/verify`
Verify donation receipt (ZEO only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "status": "VERIFIED",
  "notes": "Receipt verified against bank statement 2024-01-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Donation verified successfully",
  "donation": {
    "id": 45,
    "status": "VERIFIED"
  },
  "welfareRequest": {
    "id": 12,
    "status": "FULLY_FUNDED",
    "amountRaised": 5000.00
  }
}
```

#### `GET /api/donation`
Get donation history (role-based).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "donations": [
    {
      "id": 45,
      "amount": 2000.00,
      "status": "VERIFIED",
      "paymentMethod": "BANK_TRANSFER",
      "welfareRequest": { "id": 12, "referenceCode": "WR-2024-001" },
      "createdAt": "2024-01-15T14:20:00Z"
    }
  ]
}
```

### Circular Endpoints

#### `POST /api/circular`
Publish a circular (ZEO only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request (multipart/form-data):**
```
- title: Mid-Year Academic Circular
- content: All schools must submit progress reports by Jan 31
- recipientRoles: PRINCIPAL,TEACHER
- attachment: <file>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Circular published successfully",
  "circular": {
    "id": 8,
    "title": "Mid-Year Academic Circular",
    "publishedAt": "2024-01-15T09:00:00Z"
  }
}
```

#### `GET /api/circular`
Get circulars (role-based).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "circulars": [
    {
      "id": 8,
      "title": "Mid-Year Academic Circular",
      "content": "All schools must submit progress reports by Jan 31",
      "attachment": "/uploads/circulars/circular-8.pdf",
      "publishedAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### Resource Endpoints

#### `POST /api/resource`
Upload an educational resource (Teachers only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request (multipart/form-data):**
```
- title: Mathematics Grade 10 Syllabus
- subject: MATHEMATICS
- gradeLevel: 10
- description: Complete syllabus for grade 10 mathematics
- file: <file>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Resource uploaded successfully",
  "resource": {
    "id": 23,
    "title": "Mathematics Grade 10 Syllabus",
    "subject": "MATHEMATICS",
    "uploadedBy": "Ms. Sharma",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### `GET /api/resource/public`
Get public resources (no authentication required).

**Query Parameters:**
```
- page: 1
- limit: 50
- subject: MATHEMATICS
- gradeLevel: 10
```

**Response (200):**
```json
{
  "success": true,
  "resources": [
    {
      "id": 23,
      "title": "Mathematics Grade 10 Syllabus",
      "subject": "MATHEMATICS",
      "gradeLevel": 10,
      "uploadedBy": "Ms. Sharma",
      "filePath": "/uploads/resources/resource-23.pdf",
      "downloadCount": 15
    }
  ]
}
```

### School & Report Endpoints

#### `POST /api/report`
Submit monthly school report (Principals only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "month": "JANUARY",
  "year": 2024,
  "totalStudents": 450,
  "averageAttendance": 92.5,
  "ongoingChallenges": "Lack of lab equipment",
  "metricsJson": {
    "passRate": 88.0,
    "dropout": 2,
    "fundingNeeds": 50000
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": 5,
    "month": "JANUARY",
    "year": 2024,
    "submittedAt": "2024-01-31T23:59:00Z"
  }
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Toaster (Sonner notification system)
└── AppRouter
    ├── ProtectedRoute (Role guards)
    │   ├── AuthLayout
    │   │   ├── Login
    │   │   ├── DonorRegistration
    │   │   ├── ForgotPassword
    │   │   ├── ResetPassword
    │   │   └── ActivateAccount
    │   │
    │   └── DashboardLayout (Sidebar + Content)
    │       ├── Teacher Dashboard
    │       │   ├── CreateRequest
    │       │   ├── MyRequests
    │       │   ├── UploadResource
    │       │   └── ManageStudents
    │       │
    │       ├── Principal Dashboard
    │       │   ├── ReviewRequests
    │       │   ├── MonthlyReporting
    │       │   └── ViewCirculars
    │       │
    │       ├── ZEO Dashboard
    │       │   ├── ApproveRequests
    │       │   ├── VerifyDonations
    │       │   ├── PublishCircular
    │       │   ├── ManageUsers
    │       │   └── SystemAnalytics
    │       │
    │       └── Donor Dashboard
    │           ├── BrowseRequests
    │           ├── MakeDonation
    │           ├── DonationHistory
    │           └── MyImpact
    │
    └── Public Pages
        ├── Home
        ├── PublicResources
        ├── Unauthorized
        └── NotFound
```

### State Management

**AuthContext** - Manages:
- User authentication state
- JWT token storage
- User role and permissions
- Profile information
- Login/logout operations

```javascript
// Usage in components
const { user, role, loading, login, logout } = useAuth();
```

### API Service Layer

The `apiClient` (Axios instance) includes automatic JWT token management:

```javascript
// Request interceptor: Adds Authorization header
// Response interceptor: 
//   - Handles 401 errors by refreshing token
//   - Retries failed request with new token
//   - Handles 403 errors (unauthorized)
```

### Key Features

1. **Role-Based Route Guards** - Automatically redirects users to role-appropriate dashboards
2. **JWT Token Refresh** - Seamlessly refreshes expired access tokens
3. **Global Error Handling** - Toast notifications for API errors
4. **Protected File Downloads** - Authenticated resource and document access
5. **Responsive Design** - Mobile-friendly with Tailwind CSS

---

## ⚙️ Installation & Setup

### Prerequisites

Before installation, ensure you have:

- **Node.js** v16.0 or higher
- **npm** v7.0 or higher
- **MySQL** v5.7 or higher (or PostgreSQL 12+ or SQLite for testing)
- **Git** for version control
- A text editor (VS Code recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/EduZone.git
cd EduZone
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Edit .env with your database credentials and secrets
# See "Environment Variables" section below
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment configuration (if needed)
cp .env.example .env

# VITE_API_URL should point to your backend API
# Example: VITE_API_URL=http://localhost:5000/api
```

### Step 4: Database Setup

```bash
# From backend directory
# Sequelize will auto-create tables on first connection

# Optional: Seed database with test data
npm run seed:full

# Optional: Verify database connection
npm run verify:db
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# ============ SERVER CONFIGURATION ============
NODE_ENV=development                    # development | production | test
PORT=5000                               # Express server port
FRONTEND_URL=http://localhost:5173      # Frontend URL for CORS

# ============ DATABASE CONFIGURATION ============
DB_NAME=eduzone                         # Database name
DB_USER=root                            # MySQL username
DB_PASS=your_password_here              # MySQL password (use strong password in production)
DB_HOST=127.0.0.1                       # Database host
DB_PORT=3306                            # MySQL port (default 3306)
DB_DIALECT=mysql                        # mysql | postgres | sqlite

# ============ JWT AUTHENTICATION ============
JWT_ACCESS_SECRET=your_secret_key_here_min_32_chars    # Access token secret (min 32 chars)
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars # Refresh token secret
JWT_ACCESS_EXPIRY=15m                   # Access token expiration (e.g., 15m, 1h)
JWT_REFRESH_EXPIRY=7d                   # Refresh token expiration (e.g., 7d)
JWT_ISSUER=EduZone                      # Token issuer claim
JWT_AUDIENCE=EduZone-Users              # Token audience claim

# ============ EMAIL CONFIGURATION ============
EMAIL_USER=your_email@gmail.com         # Sender email address
EMAIL_PASS=your_app_password            # Gmail app-specific password (not your main password)
EMAIL_HOST=smtp.gmail.com               # SMTP server host
EMAIL_PORT=587                          # SMTP port (587 for TLS, 465 for SSL)
SENDER_NAME=EduZone Support             # Display name for emails

# ============ SECURITY CONFIGURATION ============
CORS_ORIGINS=http://localhost:5173,http://localhost:3000    # Comma-separated allowed origins
RATE_LIMIT_WINDOW_MS=900000             # Rate limit window (15 minutes in ms)
RATE_LIMIT_MAX_REQUESTS=100             # Max requests per window
SECURITY_HEADERS_ENABLED=true           # Enable Helmet security headers
IS_PRODUCTION=false                     # Set to true in production

# ============ FILE UPLOAD CONFIGURATION ============
MAX_FILE_SIZE=10485760                  # Max file size in bytes (10MB)
ALLOWED_UPLOAD_TYPES=pdf,doc,docx,jpg,png,jpeg # Comma-separated file types
UPLOAD_DIR=./uploads                    # Upload directory path

# ============ PAGINATION DEFAULTS ============
DEFAULT_PAGE_LIMIT=50                   # Default items per page
MAX_PAGE_LIMIT=500                      # Maximum items per page

# ============ PASSWORD RESET ============
PASSWORD_RESET_EXPIRY_MINUTES=30        # Password reset token expiration
PASSWORD_RESET_MIN_RESPONSE_TIME_MS=1000 # Minimum time before allowing reset request
```

### Frontend (.env)

```bash
# ============ API CONFIGURATION ============
VITE_API_URL=http://localhost:5000/api  # Backend API URL

# ============ FEATURE FLAGS ============
VITE_ENABLE_ANALYTICS=true              # Enable analytics tracking
VITE_ENABLE_ERROR_LOGGING=true          # Enable error logging
```

### Example Setup (Development)

**Backend .env:**
```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_NAME=eduzone
DB_USER=root
DB_PASS=root_password
DB_HOST=127.0.0.1
DB_PORT=3306

JWT_ACCESS_SECRET=my_super_secret_access_key_at_least_32_characters_long
JWT_REFRESH_SECRET=my_super_secret_refresh_key_at_least_32_characters_long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SENDER_NAME=EduZone Support

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
IS_PRODUCTION=false
```

**Frontend .env:**
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally

### Method 1: Terminal-based (Recommended for development)

#### Terminal 1 - Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
📝 API Documentation: http://localhost:5000/api/docs
⚙️  Environment: development
```

#### Terminal 2 - Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### Access Application

Open browser and navigate to:
```
http://localhost:5173
```

### Method 2: Using npm concurrently (Production-like)

From project root:

```bash
# Install concurrently globally (if not already installed)
npm install -g concurrently

# Start both servers
npm run dev:all
```

### First-Time Setup Testing

After starting servers, test the application:

1. **Visit Home Page**
   ```
   http://localhost:5173
   ```

2. **Register as Donor**
   - Click "Register" → "Donor Registration"
   - Fill in details
   - Submit (check console/email for verification code)
   - Login

3. **Create Test Data** (If database is empty)
   ```bash
   # From backend directory
   cd backend
   npm run seed:full
   ```

4. **Browse Welfare Requests**
   - As Donor, navigate to "Browse Requests"
   - View published welfare requests

5. **Check API**
   ```bash
   curl -X GET http://localhost:5000/api/welfare/published
   ```

---

## 🏗️ Building for Production

### Frontend Build

```bash
cd frontend

# Build optimized production bundle
npm run build

# Output: Creates dist/ folder with optimized files
# Size reduction through:
# - Minification
# - Tree shaking
# - Code splitting
# - Asset compression

# Preview production build locally
npm run preview
```

### Backend Build

Node.js doesn't need compilation, but prepare for deployment:

```bash
cd backend

# Run tests
npm run test

# Verify database
npm run verify:db

# Check for unused dependencies
npm install --production
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `IS_PRODUCTION=true`
- [ ] Use strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure database with production credentials
- [ ] Set up SSL/TLS certificate
- [ ] Configure CORS origins to production domains only
- [ ] Enable security headers (Helmet)
- [ ] Set up email with production SMTP server
- [ ] Configure file upload restrictions
- [ ] Set up database backups
- [ ] Enable logging and monitoring

### Production Deployment Options

#### Option 1: Heroku

```bash
# Backend
cd backend
heroku create your-app-name
git push heroku main
heroku config:set JWT_ACCESS_SECRET=your_secret_here
heroku open

# Frontend (on Vercel, Netlify, or Heroku static)
cd frontend
vercel --prod
```

#### Option 2: Docker

Create `Dockerfile` in backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t eduzone-backend .
docker run -p 5000:5000 -e NODE_ENV=production eduzone-backend
```

#### Option 3: AWS/Azure/DigitalOcean

1. Deploy backend to EC2/App Service/Droplet
2. Deploy frontend to S3/Static Web Apps/DO Spaces
3. Configure CDN for frontend
4. Set up database on RDS/Azure Database for MySQL
5. Configure SSL certificates
6. Set up monitoring and logging

---

## 🧪 Testing

### Running Tests

```bash
cd backend

# Run all tests
npm run test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage
```

### Test Files

| Test File | Coverage |
|-----------|----------|
| `auth.test.js` | Registration, login, token refresh, password reset |
| `welfare.test.js` | Create request, approve, publish, status updates |
| `donations.test.js` | Submit donation, verify receipt, status updates |
| `circulars.test.js` | Create circular, publish, retrieve |
| `resources.test.js` | Upload resource, retrieve, filter |
| `schools.test.js` | School CRUD operations |
| `transfers.test.js` | Fund transfer workflow |
| `reports.test.js` | Monthly report submission |

### Writing New Tests

Example test template:

```javascript
describe('Welfare Requests', () => {
  let request;
  let token;

  beforeAll(async () => {
    // Setup: Create test user and get token
    token = await getTestToken('TEACHER');
  });

  test('Should create welfare request', async () => {
    const res = await supertest(app)
      .post('/api/welfare')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: 1,
        category: 'FEES',
        amountRequired: 5000
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

---

## 🔄 Business Workflows

### Complete Welfare Request Workflow

```
STEP 1: Teacher Submission
├── Teacher logs in
├── Navigates to "Create Welfare Request"
├── Selects student from school's student list
├── Chooses category (FEES, MEDICAL, TRANSPORT, UNIFORM, OTHER)
├── Enters description and amount required
├── Uploads supporting document (PDF/Image)
└── Submits request
    Status: SUBMITTED
    Email: Sent to Principal

STEP 2: Principal Review
├── Principal receives notification
├── Logs in and views pending requests
├── Reviews student details, documents, teacher credibility
├── Decision: APPROVE or REJECT
└── If APPROVED:
    Status: PRINCIPAL_APPROVED
    Email: Sent to ZEO
    → If REJECTED: Status REJECTED, email teacher

STEP 3: ZEO Audit & Publication
├── ZEO reviews request with principal approval
├── Verifies:
│  ├── Document authenticity
│  ├── Student eligibility
│  ├── Amount reasonableness
│  └── School legitimacy
├── Decision: Approve or Reject
└── If APPROVED:
    Status: ZEO_APPROVED → PUBLISHED
    Request now visible to public donors

STEP 4: Donor Pledging
├── Donor browses published requests
├── Views request details, student info, funding progress
├── Chooses request and donation amount
├── Selects payment method (BANK_TRANSFER or ONLINE)
├── Uploads payment receipt/proof
└── Submits donation
    Status: PENDING (awaiting verification)

STEP 5: ZEO Verification
├── ZEO notified of new donation
├── Reviews uploaded receipt/payment proof
├── Verifies against:
│  ├── Bank statement
│  ├── Payment gateway records
│  └── Transaction authenticity
├── Decision: VERIFY or REJECT donation
└── If VERIFIED:
    Donation Status: VERIFIED
    Recalculate WelfareRequest total funded
    → If total >= required: Status FULLY_FUNDED

STEP 6: Fund Transfer
├── ZEO identifies FULLY_FUNDED requests
├── Aggregates funds from multiple donations
├── Creates bank transfer to school account
├── Records transfer details and reference
└── Marks WelfareRequest: Status TRANSFERRED
    Email: Sent to Principal & Donors

STEP 7: Distribution
├── Principal receives funds in school bank
├── Principal distributes to student (or family)
├── Records completion
└── Cycle Complete ✓
```

### Monthly Reporting Workflow

```
ZEO initiates reporting cycle for month
        ↓
Principal receives reporting reminder
        ↓
Principal logs in → Dashboard → Monthly Reporting
        ↓
Fills form:
  ├── Month & Year
  ├── Total Students
  ├── Average Attendance
  ├── Academic Metrics
  ├── Challenges & Needs
  └── Supporting documents
        ↓
Submits Report
        ↓
ZEO reviews reports (Dashboard Analytics)
        ↓
ZEO generates system-wide insights:
  ├── School performance rankings
  ├── Identified funding gaps
  ├── Regional trends
  └── Suggestions for improvement
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```
User Input Credentials
        ↓
Backend: Validate email & password
        ↓
Backend: Compare password with bcrypt hash
        ↓
If valid:
  ├── Generate Access Token (15min)
  ├── Generate Refresh Token (7days)
  └── Send Refresh Token as HTTP-Only Cookie
        ↓
Frontend: Store Access Token in Memory
        ↓
Request Protected Resource:
  ├── Attach Authorization: Bearer <accessToken>
  └── → /api/welfare
        ↓
Backend Middleware:
  ├── Extract token from header
  ├── Verify signature with JWT_ACCESS_SECRET
  ├── Check token expiration
  └── Extract user ID & role
        ↓
If Valid:
  ├── Load user profile from database
  ├── Attach user to req.user
  └── Call next middleware/controller
        ↓
If Expired/Invalid:
  ├── Frontend intercepts 401 error
  ├── Sends Refresh Token to /api/auth/refresh
  ├── Backend validates Refresh Token
  ├── Issues new Access Token
  └── Retries original request
        ↓
Request completes successfully
```

### Role-Based Access Control

```
Protected Route Component
        ↓
useAuth() hook gets: user, role, loading
        ↓
Check if role in allowedRoles
  ├── If YES → Render component
  └── If NO → Render <Unauthorized/>
        ↓
API Endpoint Authorization
        ↓
Backend Middleware: authorize('PRINCIPAL', 'ZEO')
        ↓
Check req.user.role
  ├── If in allowed roles → Call controller
  └── If NOT → Send 403 Forbidden
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Database Connection Failed**

**Error:** `connect ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify connection details in .env
# Ensure DB_HOST, DB_USER, DB_PASS are correct

# Create database if not exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS eduzone;"

# Check MySQL port (default 3306)
netstat -an | grep 3306
```

#### 2. **JWT Token Errors**

**Error:** `Invalid token` or `Token expired`

**Solutions:**
```bash
# Ensure JWT secrets in .env are long and strong (min 32 chars)
JWT_ACCESS_SECRET=your_secret_key_here_min_32_chars

# Clear browser cache and cookies
# Force login again

# Check token expiration times
JWT_ACCESS_EXPIRY=15m  # Should be short
JWT_REFRESH_EXPIRY=7d  # Should be long
```

#### 3. **Port Already in Use**

**Error:** `listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# Kill process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # macOS/Linux

# Or use different port
PORT=5001 npm run dev
```

#### 4. **CORS Errors**

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
```bash
# Add frontend URL to CORS_ORIGINS in backend .env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Or set FRONTEND_URL
FRONTEND_URL=http://localhost:5173

# Restart backend server for changes to take effect
```

#### 5. **Email Not Sending**

**Error:** `Error sending email: Invalid login`

**Solutions:**
```bash
# Verify Gmail app-specific password (not main password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # 16-char app password

# Enable "Less secure app access" in Gmail settings
# Or use app-specific password for 2FA accounts

# Check SMTP settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Test connection
npm run test:email
```

#### 6. **File Upload Issues**

**Error:** `ENOENT: no such file or directory, open './uploads/welfare/file.pdf'`

**Solutions:**
```bash
# Create uploads directory structure
mkdir -p uploads/welfare
mkdir -p uploads/donations
mkdir -p uploads/resources
mkdir -p uploads/circulars
mkdir -p uploads/profiles

# Or run seeding script (creates directories)
npm run seed:full

# Check file size limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

#### 7. **Frontend Not Loading**

**Error:** `GET http://localhost:5173/index.html 404 (Not Found)`

**Solutions:**
```bash
# Ensure frontend dependencies installed
cd frontend
npm install

# Check if Vite dev server is running
npm run dev

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check for port conflicts
npm run dev -- --port 5173
```

#### 8. **Authentication Not Working**

**Error:** `Invalid credentials` or stuck on login page

**Solutions:**
```bash
# Verify user exists in database
mysql -u root -p eduzone
SELECT * FROM users WHERE email='test@example.com';

# Check password hashing
# Verify authController.js is using bcryptjs

# Clear browser storage
// In console:
localStorage.clear()
sessionStorage.clear()

# Try registering new donor account
```

#### 9. **Donation Receipt Not Uploading**

**Error:** `File upload failed` or `Unsupported file type`

**Solutions:**
```bash
# Check allowed file types
ALLOWED_UPLOAD_TYPES=pdf,doc,docx,jpg,png,jpeg

# Verify file size is within limit
MAX_FILE_SIZE=10485760  # 10MB

# Check Multer configuration
uploadMiddleware.js should allow donation receipts

# Ensure uploads directory has write permissions
chmod -R 755 uploads/donations
```

#### 10. **Test Failures**

**Error:** `Tests failing with database errors`

**Solutions:**
```bash
# Ensure test database is set up
NODE_ENV=test npm test

# Check jest.config.js
# Verify setup.js creates test database

# Run individual test
npm test -- auth.test.js

# View detailed error output
npm test -- --verbose
```

---

## 🤝 Contributing

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/EduZone.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, well-documented code
   - Follow existing code style
   - Add tests for new functionality

4. **Commit Changes**
   ```bash
   git commit -m "feat: add new feature

   - Add specific feature details
   - Reference issue number if applicable #123"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe your changes clearly
   - Reference related issues
   - Include test results

### Coding Standards

- **Backend**: Node.js/Express conventions
- **Frontend**: React hooks + functional components
- **Database**: Sequelize ORM patterns
- **Naming**: camelCase for variables, UPPER_CASE for constants
- **Comments**: JSDoc for functions, explain complex logic
- **Testing**: Jest with >80% coverage

### Setting Up Development Environment

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev:all

# Run linter (if configured)
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build production bundle
npm run build
```

---

## 📝 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

ISC (Internet Software Consortium License) is a permissive free software license.
- ✅ You can use for commercial purposes
- ✅ You can modify the code
- ✅ You can distribute modifications
- ⚠️ You must include license and copyright notice

---

## 🎯 Future Improvements & Roadmap

### Planned Features (v1.1)

- [ ] **SMS Notifications** - Alert stakeholders via SMS
- [ ] **Mobile Application** - Native iOS/Android apps
- [ ] **Advanced Analytics** - ML-based funding predictions
- [ ] **Integration with Payment Gateways** - Razorpay, PayPal
- [ ] **Blockchain Verification** - Immutable donation records
- [ ] **Multi-language Support** - Hindi, regional languages
- [ ] **Video Verification** - Student welfare video verification
- [ ] **Government Integration** - Link with education ministry systems

### Performance Improvements

- [ ] Implement caching layer (Redis)
- [ ] Database query optimization with indexes
- [ ] Image compression and CDN delivery
- [ ] Lazy loading for paginated lists
- [ ] GraphQL API (alternative to REST)

### Security Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Biometric login support
- [ ] End-to-end encryption for sensitive data
- [ ] Penetration testing
- [ ] GDPR compliance features

### Scalability

- [ ] Horizontal scaling with load balancer
- [ ] Database replication for high availability
- [ ] Microservices architecture
- [ ] Event-driven architecture with queues
- [ ] Kubernetes deployment

---

## 📞 Support & Contact

### Getting Help

1. **Documentation**: Check this README and project_flow_and_explanation.md
2. **Issues**: Search GitHub issues for similar problems
3. **Code Comments**: Most code has inline documentation
4. **Tests**: Look at test files for usage examples

### Reporting Issues

When reporting issues, please include:

```markdown
**Description**: Brief description of the issue

**Expected Behavior**: What should happen

**Actual Behavior**: What is actually happening

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Environment**:
- OS: Windows 10 / macOS / Linux
- Node version: 18.0
- npm version: 9.0
- Browser: Chrome 120

**Error Message/Logs**:
```
(paste error message and relevant logs)
```
```

---

## 📊 Project Statistics

- **Backend Models**: 20+ Sequelize models
- **API Endpoints**: 30+ REST endpoints
- **Frontend Components**: 50+ React components
- **Test Coverage**: 80%+ code coverage
- **Lines of Code**: ~15,000+ LOC
- **Documentation**: Comprehensive with diagrams

---

## 🙏 Acknowledgments

- Built with modern JavaScript/React ecosystem
- Security best practices from OWASP
- Architecture inspired by educational fintech platforms
- Community feedback and contributions

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

*For detailed technical documentation, see [project_flow_and_explanation.md](./project_flow_and_explanation.md)*

*For database schema details, see [EduZone_ER_Final.drawio](./EduZone_ER_Final.drawio)*
