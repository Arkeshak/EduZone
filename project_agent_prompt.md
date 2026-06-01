# 🤖 Master AI Agent Prompt: EduZone Platform Reconstruction Specification

**Copy, paste, and run the prompt below in your target AI coding agent (e.g., Claude, Cursor, v0, GPT-4o, or any web development agent). It contains complete instructions, data schemas, API routes, and design systems needed to build this platform from scratch.**

---

```markdown
You are a senior full-stack web developer and UI/UX expert. Your task is to build a complete, highly-scalable, and beautifully designed web application called "EduZone"—a collaborative educational management, announcement, and student welfare crowdfunding platform. 

Implement this application using a decoupled client-server architecture.

---

### 🛠️ 1. Technical Stack Requirements

#### Frontend:
*   **Core:** React.js (Vite environment)
*   **Routing:** React Router v6 (supporting protected role-based layouts)
*   **Styling:** Tailwind CSS combined with `shadcn/ui` components (Radix UI primitives)
*   **State & API Fetching:** Axios with interceptor-based token auto-refresh
*   **Icons & Toasts:** Lucide React & Sonner (Toast notifications)

#### Backend:
*   **Core:** Node.js with Express.js
*   **Database:** Relational database managed via Sequelize ORM (MySQL/PostgreSQL/SQLite)
*   **Security:** JWT authentication, bcryptjs (hashing), xss-filters, helmet, cors
*   **File Uploads:** Multer (handling PDF circular attachments and bank receipts)

---

### 🎨 2. Design Aesthetics & Visual Identity
Build a responsive, highly premium dashboard interface. Do not use generic browser defaults or basic layouts.
*   **Color Palette:** Harmony-centric dark mode or sleek glassmorphic white/slate themes. Primary color: Deep Indigo/Cobalt (`#3b82f6` to `#4f46e5`). Success color: Emerald (`#10b981`). Warning color: Amber (`#f59e0b`).
*   **Typography:** Google Fonts Inter or Outfit. Clean, high-readability sans-serif hierarchy.
*   **Micro-interactions:** Hover transformations on cards, smooth scale-in transitions on modals, skeleton loader screens during API fetches, and active state indicators on sidebar items.

---

### 🗄️ 3. Database Schema & Models Definition (Sequelize Specification)
Generate the database using Sequelize ORM with these strict schemas and relational mappings:

1.  **User (id, full_name, email, password_hash, role [ZEO, PRINCIPAL, TEACHER, DONOR], is_verified, is_active, refresh_token, profile_picture, phone_number, address)**
2.  **School (id, name, address, bank_name, account_number)**
3.  **Principal (id, userId, schoolId, office_extension)**
4.  **Teacher (id, userId, schoolId, credentials_summary)**
5.  **Donor (id, userId, tax_id, is_anonymous_preference)**
6.  **Student (id, schoolId, full_name, grade, parent_name, contact_number)**
7.  **WelfareRequest (id, reference_code, studentId, teacherId, schoolId, category, description, amount_required, amount_raised [default 0], status [SUBMITTED, PRINCIPAL_APPROVED, ZEO_APPROVED, PUBLISHED, PARTIALLY_FUNDED, FULLY_FUNDED, TRANSFERRED, REJECTED], priority [LOW, MEDIUM, HIGH])**
8.  **WelfareRequestDocument (id, welfareRequestId, file_path, document_type)**
9.  **WelfareApproval (id, welfareRequestId, approvedBy [userId], status_before, status_after, remarks)**
10. **Donation (id, donorId, schoolId [nullable], welfareRequestId [nullable], amount, payment_method [ONLINE, BANK_TRANSFER], status [PENDING, VERIFIED, REJECTED], receipt_reference, is_anonymous)**
11. **Transfer (id, welfareRequestId, donationId, schoolId, amount, transfer_reference, proof_url, transferred_by [userId], transferred_at)**
12. **Subject (id, name, code)**
13. **TeacherSubject (teacherId, subjectId) [Many-to-Many Bridge]**
14. **Resource (id, teacherId, subjectId, schoolId, title, file_path, grade_level)**
15. **Circular (id, title, content, publishedBy [userId])**
16. **CircularRecipient (id, circularId, recipient_id [userId])**
17. **CircularAttachment (id, circularId, file_path)**
18. **MonthlyReport (id, schoolId, report_date, student_count, average_attendance, issues_logged)**
19. **Notification (id, userId, message, is_read)**

---

### 🔄 4. Core Business Flows & Workflows

#### Flow A: Welfare Request & Funding Lifecycle
1.  **Teacher** submits a welfare request for a student in their school, specifying the category, amount, description, and supporting files. Status: `SUBMITTED`.
2.  **Principal** audits requests originating from their school's teachers. Can either click "Endorse" (status changes to `PRINCIPAL_APPROVED`) or "Reject" (status changes to `REJECTED`).
3.  **ZEO** reviews principal-approved requests. Approves documents, publishes the request. Status becomes `PUBLISHED`.
4.  **Donor** views published requests, pledges money, and uploads a bank transfer receipt. A `Donation` is logged as `PENDING`.
5.  **ZEO** verifies the donation slip against the bank account. Clicking "Verify" must execute inside a database Transaction:
    *   Set Donation status to `VERIFIED`.
    *   Increment the WelfareRequest's `amount_raised`.
    *   If `amount_raised` equals or exceeds `amount_required`, transition request to `FULLY_FUNDED`.
6.  **ZEO** completes a physical bank transfer to the school's bank account, uploading a transaction slip. A `Transfer` is logged, and the WelfareRequest transitions to `TRANSFERRED`.

#### Flow B: Circular Dispatches
*   **ZEO** uploads a circular (PDF attachment) and assigns target recipient groups (Principals, Teachers, or both).
*   System maps user records, logs recipients in `CircularRecipient`, and sends targeted push/dashboard notifications.
*   **Principals/Teachers** see new items in their sidebar "Circulars" tab with secure PDF download endpoints.

#### Flow C: Study Resource Sharing Hub
*   **Teachers** upload study material PDFs mapped to standard subjects and grade levels.
*   **Public/Donors** can access `/resources` without logging in to search, filter by subject or grade, and download the documents.

---

### 🛡️ 5. Technical Requirements & Best Practices

1.  **JWT Authentication with Auto-Refresh:**
    *   Write a custom Axios interceptor on the React frontend.
    *   Keep access tokens short-lived (15 minutes) in client-side memory.
    *   Upon receiving a `401 Unauthorized` response, call `/api/auth/refresh` to renew the access token using a secure `httpOnly` refresh cookie, and replay the original HTTP request.
2.  **ACID Database Transactions:**
    *   Ensure any double-entry accounting operations (such as verifying a donation and incrementing the welfare request funds) are explicitly wrapped in database transactions so that failures automatically roll back both operations.
3.  **API Route Blueprint:**
    *   `/api/auth` - Login, registration, token refresh, email verification, activation, password reset.
    *   `/api/welfare` - Submit, get, endorse, audit, and publish welfare requests.
    *   `/api/donations` - Pledge donations, upload slip proofs, verify slips.
    *   `/api/transfers` - Log transfers to school bank accounts.
    *   `/api/circulars` - Publish and fetch regional notifications and documents.
    *   `/api/resources` - Upload and browse files.
    *   `/api/reports` - Monthly school statistics submitted by Principals to the ZEO.

---

### 🖥️ 6. Screen & View Mockups Needed

*   **Home/Landing:** Beautiful marketing page featuring active public welfare needs, search filters, call-to-actions, and statistics (total funds raised, school count).
*   **Unified Auth (Login / Donor Registration):** Premium glassmorphic forms with robust feedback and form validation alerts.
*   **Dynamic Role-Based Portals (Unified Dashboard Layout):**
    *   *Teacher View:* Request creation form, resource upload form, personal requests tracker.
    *   *Principal View:* Grid of pending requests with modal approvals, monthly report builder, received funds dashboard.
    *   *ZEO View:* High-fidelity dashboards showcasing donor charts, request list queues, circular writer, and donation verification modules.
    *   *Donor View:* Clean marketplace grid of active requests, payment slide-over sheet, donation tracking history page.

Proceed to generate the full system codebase following these exact requirements. Start by scaffolding the backend Sequelize schemas and structural folders.
```
