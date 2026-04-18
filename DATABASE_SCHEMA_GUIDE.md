# 🗄️ Database Schema: Understanding How Data is Organized

## What is a Database?

Think of a database as an **Excel spreadsheet with multiple sheets**.

Each sheet = a table
Each row = one record
Each column = a field

```
User Table:
| id | email           | fullName    | role    |
|----|-----------------|-------------|---------|
| 1  | john@gmail.com  | John Smith  | DONOR   |
| 2  | jane@gmail.com  | Jane Doe    | TEACHER |
| 3  | ahmed@gmail.com | Ahmed Khan  | ZEO     |

Donor Table:
| id | userId | organizationName  |
|----|--------|------------------|
| 1  | 1      | My Charity       |

Teacher Table:
| id | userId | schoolId |
|----|--------|----------|
| 1  | 2      | 2        |
```

---

## All Tables in EduZone

### 1. User Table
**What it stores**: Login information for all users

```
Columns:
- id (PRIMARY KEY) - Unique identifier (1, 2, 3, ...)
- email - Unique email address (john@gmail.com)
- passwordHash - Encrypted password ($2a$10$...)
- fullName - Person's name (John Smith)
- role - ENUM (DONOR, TEACHER, PRINCIPAL, ZEO)
- isVerified - Boolean (true/false) - Email verified?
- isActive - Boolean (true/false) - Account active?
- activationToken - 6-digit code for email verification
- activationExpires - When verification code expires
- refreshToken - Token for getting new access token
- createdAt - When account created
- updatedAt - When last updated

Example Row:
{
  id: 1,
  email: "john@gmail.com",
  passwordHash: "$2a$10$N9qo8uLOickgx2ZS9suSwuPC15BSfTmFL97Q8x8agn7GcJQlC5pJm",
  fullName: "John Smith",
  role: "DONOR",
  isVerified: true,
  isActive: true,
  createdAt: "2024-04-16 10:00:00"
}

Usage:
- Used to login
- Used to check permissions
- Linked to other tables (Donor, Teacher, Principal)
```

### 2. Donor Table
**What it stores**: Donor-specific information

```
Columns:
- id (PRIMARY KEY)
- userId (FOREIGN KEY) - Links to User table
- organizationName - Name of donor's organization
- totalDonated - Total amount donated (calculated)
- contactPerson - Name of contact
- phone - Phone number
- address - Address
- createdAt - When registered

Example Row:
{
  id: 1,
  userId: 1,  ← Linked to User #1
  organizationName: "My Charity Foundation",
  totalDonated: 50000,
  phone: "03001234567",
  createdAt: "2024-04-16 10:05:00"
}

Relationship:
Donor.userId = User.id
(One Donor linked to One User)

Usage:
- Store donor information
- Track donor's total donations
- Filter requests by donor preference
```

### 3. School Table
**What it stores**: School information

```
Columns:
- id (PRIMARY KEY)
- name - School name (Lincoln High School)
- division - School division/district
- address - School address
- phone - School contact number
- principal - Principal's name (stored as text)
- bankAccountNumber - School's bank account (for transfers)
- bankAccountName - Name on bank account
- createdAt

Example Row:
{
  id: 1,
  name: "Lincoln High School",
  division: "District 5",
  address: "Main Street, City",
  phone: "02234567890",
  bankAccountNumber: "1234567890",
  bankAccountName: "Lincoln High School",
  createdAt: "2024-01-01 09:00:00"
}

Relationships:
- School 1:Many Teacher (one school has many teachers)
- School 1:One Principal (one school has one principal)
- School 1:Many Student (one school has many students)

Usage:
- Store school information
- Link teachers/principals to schools
- Transfer funds to school's bank account
```

### 4. Teacher Table
**What it stores**: Teacher information

```
Columns:
- id (PRIMARY KEY)
- userId (FOREIGN KEY) - Links to User table
- schoolId (FOREIGN KEY) - Links to School table
- subjectSpecialization - Main subject taught
- experienceYears - Years of experience
- createdAt

Example Row:
{
  id: 1,
  userId: 2,  ← Linked to User #2
  schoolId: 1,  ← Works at School #1
  subjectSpecialization: "Mathematics",
  experienceYears: 5,
  createdAt: "2024-02-01 08:00:00"
}

Relationships:
- Teacher.userId = User.id (One Teacher linked to One User)
- Teacher.schoolId = School.id (Teacher works at one School)

Usage:
- Store teacher information
- Link teacher to their school
- Track which teacher submitted requests
- Query teachers by school
```

### 5. Principal Table
**What it stores**: Principal information

```
Columns:
- id (PRIMARY KEY)
- userId (FOREIGN KEY) - Links to User table
- schoolId (FOREIGN KEY) - Links to School table
- appointmentDate - When became principal
- createdAt

Example Row:
{
  id: 1,
  userId: 3,  ← Linked to User #3
  schoolId: 1,  ← Heads School #1
  appointmentDate: "2020-01-15",
  createdAt: "2024-02-01 08:00:00"
}

Relationships:
- Principal.userId = User.id (One Principal linked to One User)
- Principal.schoolId = School.id (One Principal heads one School)

Usage:
- Store principal information
- Link principal to their school
- Check principal's school when approving requests
- Ensure each school has only one principal
```

### 6. Student Table
**What it stores**: Student information

```
Columns:
- id (PRIMARY KEY)
- name - Student name
- schoolId (FOREIGN KEY) - Links to School table
- grade - Grade/Class (e.g., "10-A")
- section - Section (A, B, C, etc)
- enrollmentNumber - Student ID number
- createdAt

Example Row:
{
  id: 1,
  name: "Ahmed Hassan",
  schoolId: 1,  ← Studies at School #1
  grade: "10",
  section: "A",
  enrollmentNumber: "12345",
  createdAt: "2024-01-10 09:00:00"
}

Relationships:
- Student.schoolId = School.id
- Student 1:Many WelfareRequest (student can have multiple requests)

Usage:
- Store student information
- Link requests to students
- Group students by school
```

### 7. WelfareRequest Table
**What it stores**: Student financial assistance requests

```
Columns:
- id (PRIMARY KEY)
- studentId (FOREIGN KEY) - Links to Student
- studentName - Student name (for quick reference)
- grade - Student grade (10-A)
- welfareType - Type of help needed (Books, Uniforms, Fees, etc)
- description - Reason/explanation
- estimatedCost - Amount requested
- teacherId (FOREIGN KEY) - Teacher who submitted
- schoolId (FOREIGN KEY) - Which school
- status - ENUM (SUBMITTED, PRINCIPAL_APPROVED, ZEO_APPROVED, 
                  PUBLISHED, PARTIALLY_FUNDED, FULLY_FUNDED, TRANSFERRED, REJECTED)
- fundedAmount - Total donations received so far
- approvalDate - When principal approved
- publishDate - When ZEO published
- fullyFundedDate - When reached target amount
- transferDate - When funds transferred
- createdAt

Example Row:
{
  id: 1,
  studentId: 1,  ← About Student #1
  studentName: "Ahmed Hassan",
  grade: "10-A",
  welfareType: "Books",
  description: "Needs textbooks for this semester",
  estimatedCost: 5000,
  teacherId: 1,  ← Submitted by Teacher #1
  schoolId: 1,   ← From School #1
  status: "PUBLISHED",
  fundedAmount: 2500,  ← Received 2500 so far
  approvalDate: "2024-04-16 11:00:00",
  publishDate: "2024-04-16 14:00:00",
  createdAt: "2024-04-16 10:30:00"
}

Relationships:
- WelfareRequest.studentId = Student.id
- WelfareRequest.teacherId = Teacher.userId (or User.id)
- WelfareRequest.schoolId = School.id
- WelfareRequest 1:Many Donation (request can receive many donations)
- WelfareRequest 1:One Transfer (request transfers once it's fully funded)

Status Flow:
SUBMITTED → PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED 
          → PARTIALLY_FUNDED → FULLY_FUNDED → TRANSFERRED
(Can be REJECTED at any stage)

Usage:
- Core table for the app
- Track request status
- Calculate funding progress
- Audit trail of approvals
```

### 8. Donation Table
**What it stores**: Donations to welfare requests

```
Columns:
- id (PRIMARY KEY)
- donorId (FOREIGN KEY) - Links to Donor
- requestId (FOREIGN KEY) - Links to WelfareRequest
- amount - Donation amount
- paymentMethod - "Online" or "Bank Transfer"
- status - "COMPLETED", "PENDING", "FAILED"
- bankTransactionId - Bank's transaction ID (for proof)
- donorNotes - Optional message from donor
- createdAt

Example Row:
{
  id: 1,
  donorId: 1,  ← Donated by Donor #1
  requestId: 1,  ← Donated to Request #1
  amount: 1000,
  paymentMethod: "Bank Transfer",
  status: "COMPLETED",
  bankTransactionId: "TXN-2024-001",
  createdAt: "2024-04-16 15:30:00"
}

Example Row 2:
{
  id: 2,
  donorId: 2,  ← Donated by Donor #2
  requestId: 1,  ← Donated to same Request #1
  amount: 1500,
  paymentMethod: "Online",
  status: "COMPLETED",
  createdAt: "2024-04-16 16:00:00"
}

Relationships:
- Donation.donorId = Donor.id
- Donation.requestId = WelfareRequest.id

Usage:
- Record each donation
- Track total donations per request (sum all donations for a request)
- Payment history for donors
- Evidence of donations
```

### 9. Transfer Table
**What it stores**: Money transfers to schools

```
Columns:
- id (PRIMARY KEY)
- requestId (FOREIGN KEY) - Links to WelfareRequest
- schoolId (FOREIGN KEY) - Links to School
- amount - Amount transferred
- initiatedBy - User who initiated (Principal)
- status - ENUM (INITIATED, VERIFIED, TRANSFERRED, FAILED)
- bankAccountNumber - School's bank account
- bankAccountName - Name on account
- bankTransactionId - Bank's transaction ID
- transferDate - When money was sent
- errorMessage - If failed, why?
- createdAt

Example Row:
{
  id: 1,
  requestId: 1,  ← Transferring for Request #1
  schoolId: 1,   ← To School #1
  amount: 2500,
  initiatedBy: 3,  ← Principal #3 initiated
  status: "TRANSFERRED",
  bankAccountNumber: "1234567890",
  bankTransactionId: "TXN-2024-BANK-001",
  transferDate: "2024-04-16 16:30:00",
  createdAt: "2024-04-16 16:15:00"
}

Relationships:
- Transfer.requestId = WelfareRequest.id
- Transfer.schoolId = School.id

Usage:
- Track fund transfers to schools
- Verify transfer status
- Audit trail for accounting
- Bank transaction references
```

### 10. PasswordReset Table
**What it stores**: Password reset tokens

```
Columns:
- id (PRIMARY KEY)
- userId (FOREIGN KEY) - Links to User
- tokenHash - Hashed reset token (from email link)
- expiresAt - When token expires
- used - Boolean - Has this token been used?
- createdAt

Example Row:
{
  id: 1,
  userId: 1,  ← User forgot password
  tokenHash: "$2a$10$...",  ← Hashed token
  expiresAt: "2024-04-17 10:00:00",  ← Expires tomorrow
  used: false,
  createdAt: "2024-04-16 10:00:00"
}

Usage:
- Store password reset requests
- Verify reset tokens
- Prevent token reuse (set used: true after use)
- Clean up expired tokens
```

---

## How Tables Are Connected (Relationships)

### One-to-One Relationships
```
User 1:1 Donor
- One user can be one donor
- One donor belongs to one user
- Example: User #1 "john@gmail.com" → Donor #1 "My Charity"

User 1:1 Teacher
- One user can be one teacher
- One teacher belongs to one user
- Example: User #2 "jane@gmail.com" → Teacher #1

User 1:1 Principal
- One user can be one principal
- One principal belongs to one user
- Example: User #3 "ahmed@gmail.com" → Principal #1
```

### One-to-Many Relationships
```
School 1:Many Teacher
- One school has many teachers
- Example: Lincoln High School has Teachers A, B, C, D

School 1:Many Student  
- One school has many students
- Example: Lincoln High School has Students 1, 2, 3...

School 1:Many WelfareRequest
- One school's students create many requests
- Example: School #1 has Requests 1, 2, 3, 4...

WelfareRequest 1:Many Donation
- One request can receive many donations
- Example: Request #1 receives Donations 1, 2, 3 (from donors 1, 2, 3)

Donor 1:Many Donation
- One donor can make many donations
- Example: Donor #1 made Donations 1, 5, 8 (to requests 1, 2, 3)
```

### Visual Relationship Diagram

```
┌─────────────┐
│    User     │ (id, email, password, role)
└─────────────┘
      │
      ├─→ (1:1) Donor (organizationName, phone)
      ├─→ (1:1) Teacher ─→ (M:1) School (name, division)
      ├─→ (1:1) Principal ─→ (M:1) School
      └─→ (1:1) PasswordReset (token, expiry)

          School (1:M)
            │├─→ Teacher
            │├─→ Principal
            │├─→ Student ─→ (1:M) WelfareRequest ─→ (1:M) Donation ←─ (M:1) Donor
            │└─→ Transfer ←─ (1:1) WelfareRequest
            └─→ Student (grade, section)

        WelfareRequest (statuses)
             SUBMITTED
                ↓
          PRINCIPAL_APPROVED
                ↓
            ZEO_APPROVED
                ↓
            PUBLISHED ←─ Donors can donate here
                ↓
          PARTIALLY_FUNDED ←─ Some donations received
                ↓
          FULLY_FUNDED ←─ Enough donations to transfer
                ↓
            TRANSFERRED ←─ Money sent to school
```

---

## Querying Examples (How code accesses data)

### Example 1: Get all requests for a school

```javascript
// SQL-like query
const requests = await WelfareRequest.findAll({
    where: { schoolId: 1 }  // Requests where schoolId = 1
});

// Result: All welfare requests for School #1
```

### Example 2: Get teacher's school

```javascript
// Get Teacher #1 with their associated School
const teacher = await Teacher.findOne({
    where: { id: 1 },
    include: [{ model: School, as: 'school' }]  // Include school info
});

// Result: 
// {
//   id: 1,
//   userId: 2,
//   schoolId: 1,
//   school: { id: 1, name: 'Lincoln High', ... }
// }
```

### Example 3: Calculate total donations for a request

```javascript
// Get all donations for Request #1
const donations = await Donation.findAll({
    where: { requestId: 1 }
});

// Sum them up
const totalFunded = donations.reduce((sum, d) => sum + d.amount, 0);
// Result: 2500
```

### Example 4: Check if request is fully funded

```javascript
const request = await WelfareRequest.findOne({
    where: { id: 1 }
});

const totalDonated = await Donation.sum('amount', {
    where: { requestId: 1 }
});

if (totalDonated >= request.estimatedCost) {
    // Fully funded!
    request.status = 'FULLY_FUNDED';
} else {
    // Partial
    request.status = 'PARTIALLY_FUNDED';
}
```

---

## Data Integrity Rules

### Foreign Keys (Referential Integrity)

```
If Teacher has schoolId = 5, then School #5 MUST exist
If you try to delete School #5, database prevents it (teachers still need school!)
```

### Unique Constraints

```
User.email is UNIQUE
- Can't have two users with same email
- Database prevents duplicate emails automatically
```

### Enum Values

```
WelfareRequest.status can ONLY be:
- 'SUBMITTED'
- 'PRINCIPAL_APPROVED'
- 'ZEO_APPROVED'
- 'PUBLISHED'
- 'PARTIALLY_FUNDED'
- 'FULLY_FUNDED'
- 'TRANSFERRED'
- 'REJECTED'

Can't set status to 'INVALID' or any other value
```

### NOT NULL Constraints

```
User.email CANNOT be null
Student.name CANNOT be null

These MUST have a value
```

---

## Database Transaction Example

When Teacher submits Welfare Request:

```
START TRANSACTION
  1. Create Student (if doesn't exist)
  2. Create WelfareRequest
  3. Send verification email
IF email fails:
  ROLLBACK (undo steps 1-2)
ELSE:
  COMMIT (save steps 1-2 permanently)
```

**Why?** Prevent partial data. Either everything succeeds or everything fails.

---

## Viewing the Database

### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to database
3. Go to Schemas
4. Expand database name
5. See all tables
6. Click table to see data
7. Run queries

### Using Command Line

```bash
# Connect to database
mysql -u root -p

# Use EduZone database
USE eduzone;

# See all tables
SHOW TABLES;

# See table structure
DESCRIBE User;

# See table data
SELECT * FROM User;

# See data with condition
SELECT * FROM WelfareRequest WHERE status = 'PUBLISHED';

# Count records
SELECT COUNT(*) FROM Donation;

# Sum donations
SELECT SUM(amount) FROM Donation;
```

---

## Common Database Operations in Code

```javascript
// CREATE (insert)
const user = await User.create({ email, passwordHash, ... });

// READ (select)
const user = await User.findOne({ where: { email } });
const users = await User.findAll();

// UPDATE (modify)
user.isVerified = true;
await user.save();

// DELETE (remove)
await user.destroy();

// With relationships
const teacher = await Teacher.findOne({
    where: { id: 1 },
    include: [{ model: School }]  // Also get school info
});
```

---

You now understand the complete database structure! 🎉

The database is the heart of the application - all data flows through these tables. Understanding how they connect helps you understand the entire system.
