# EduZone - Educational Welfare & Management Platform

EduZone is a robust, multi-role digital platform designed to streamline welfare requests, donation transparency, circular distribution, and educational resource management within a school zone. It connects educators, administrations, and generous donors to ensure students receive the financial and material support they need effectively and transparently.

## 🌟 Key Features

*   **Role-Based Dashboards:** Distinct, secure interfaces and capabilities for Zonal Educational Officers (ZEO), Principals, Teachers, and Donors.
*   **Welfare Request Workflow:** A structured pipeline allowing Teachers to submit student welfare needs (like supplies, fees, transport), which are vetted by Principals, approved by the ZEO, and published transparently for funding.
*   **Transparent Donation Engine:** Secure donor portal for pledging funds to specific requests or general pools. Enforces strict verification workflows using uploaded bank receipts before funds are released to school bank accounts.
*   **Circulars & Communications:** Centralized announcement distribution system for ZEOs to dispatch official circulars with attachments instantly to school Principals and Teachers.
*   **Resource Hub:** A collaborative space for Teachers to upload, categorize, and discover educational materials (PDFs, study guides) across different subjects and grade levels.
*   **Deep Security:** Implements JWT-based authentication with auto-refresh mechanisms, role authorization guards, input sanitization, and strict password constraints to keep student and donor data secure.

---

## 🏗️ Technology Stack

EduZone is built using a modern JavaScript/TypeScript stack, optimized for performance, scalability, and maintainability.

### Frontend
*   **Core:** React.js powered by Vite for lightning-fast compilation.
*   **Routing:** React Router v6 for nested, role-protected layouts.
*   **UI/Styling:** Tailwind CSS integrated with `shadcn/ui` components (Radix UI) for accessible, responsive, and beautiful interfaces.
*   **State & Fetching:** Axios with custom interceptors for seamless JWT token management and centralized state tracking.
*   **Icons & Notifications:** Lucide React (icons) and Sonner (toast notifications).

### Backend
*   **Core:** Node.js with Express framework.
*   **Database:** Relational database managed through **Sequelize ORM**, allowing for complex associations between Users, Schools, Requests, and Donations.
*   **Security layer:** Helmet (HTTP headers), bcryptjs (password hashing), jsonwebtoken (auth), `xss` (cross-site scripting prevention), and express-rate-limit.
*   **File Uploads:** Multer for handling multipart/form-data (resource files, donation receipts, circular attachments).

---

## 👥 User Roles & Permissions

1.  **ZEO Admin (Zonal Education Officer):** The top-level administrator. Can manage user accounts, publish official circulars, approve verified welfare requests for publication, and verify donor payment receipts for fund disbursement.
2.  **Principal:** Approves welfare requests originating from teachers in their specific school. Submits monthly school performance reports to the ZEO.
3.  **Teacher:** Identifies student needs and submits welfare requests with estimated costs. Can upload and download shared educational resources and view received circulars.
4.  **Donor:** Browses verified, published welfare requests in need of funding. Submits donations, uploads payment proofs, and tracks the real-time funding status and ultimate impact of their transactions.

---

## 🚀 Getting Started

Follow these steps to run the EduZone platform locally for development or demonstration.

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v16.0 or higher recommended)
*   A running SQL database instance (MySQL, PostgreSQL, or SQLite via configuration)

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory using the provided example:
```bash
cp .env.example .env
# Edit .env with your specific database credentials and JWT secrets
```

Start the backend development server:
```bash
npm run dev
```
*The server typically runs on `http://localhost:5000`.*

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (if required) to set the API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
*The web interface will typically run on `http://localhost:5173`.*

---

## 📂 System Architecture Overview

```text
EduZone/
│
├── backend/                  # Express API Server
│   ├── config/               # DB & server constants
│   ├── controllers/          # Business logic (welfare, donations, etc.)
│   ├── middleware/           # Auth walls, validation, error handling
│   ├── models/               # Sequelize DB schemas & relationships
│   ├── routes/               # API endpoint definitions
│   ├── seeders/              # Database population scripts
│   └── uploads/              # Local storage for receipts/resources
│
└── frontend/                 # React Application
    ├── src/
    │   ├── components/       # Reusable UI elements (Cards, Dialogs, Inputs)
    │   ├── context/          # React Context (AuthContext)
    │   ├── layouts/          # Dashboard framing & sidebars
    │   ├── pages/            # Role-specific dashboard views
    │   ├── services/         # Axios API clients
    │   └── utils/            # JWT helpers and formatters
    └── public/               # Static assets & icons
```

## 🔐 Security & Best Practices

*   **Token Refreshing:** The system does not store sensitive sessions indefinitely. It uses short-lived Access Tokens complemented by automatically renewing Refresh Tokens to maximize workflow security.
*   **Transaction Safety:** Complex backend operations (like verified donations creating school transfer records while updating request limits) are wrapped in **SQL Transactions** to guarantee data integrity across multiple tables.
*   **Data Validation:** All incoming data is rigorously sanitized against script injections and validated for types and size constraints before database insertion.
