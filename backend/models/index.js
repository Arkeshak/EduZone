const sequelize = require('../config/db');

// Import Models
const User = require('./User');
const PasswordReset = require('./PasswordReset');
const School = require('./School');
const Principal = require('./Principal');
const Teacher = require('./Teacher');
const Subject = require('./Subject');
const TeacherSubject = require('./TeacherSubject');
const Student = require('./Student');
const WelfareRequest = require('./WelfareRequest');
const WelfareRequestDocument = require('./WelfareRequestDocument');
const WelfareApproval = require('./WelfareApproval');
const Donor = require('./Donor');
const Donation = require('./Donation');
const Transfer = require('./Transfer');
const Resource = require('./Resource');
const Circular = require('./Circular');
const CircularRecipient = require('./CircularRecipient');
const CircularAttachment = require('./CircularAttachment');
const MonthlyReport = require('./MonthlyReport');
const Notification = require('./Notification');

// --- Associations ---

// 1. Password Resets
User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. Principal
User.hasOne(Principal, { foreignKey: 'userId', as: 'principalProfile' });
Principal.belongsTo(User, { foreignKey: 'userId', as: 'user' });
School.hasOne(Principal, { foreignKey: 'schoolId', as: 'principal' });
Principal.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 3. Teacher
User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
School.hasMany(Teacher, { foreignKey: 'schoolId', as: 'teachers' });
Teacher.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 4. Subjects
Teacher.belongsToMany(Subject, { through: TeacherSubject, foreignKey: 'teacherId', as: 'subjects' });
Subject.belongsToMany(Teacher, { through: TeacherSubject, foreignKey: 'subjectId', as: 'teachers' });

// 5. Student
School.hasMany(Student, { foreignKey: 'schoolId', as: 'students' });
Student.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 6. Welfare Request
Student.hasMany(WelfareRequest, { foreignKey: 'studentId', as: 'requests' });
WelfareRequest.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Teacher.hasMany(WelfareRequest, { foreignKey: 'teacherId', as: 'submittedRequests' });
WelfareRequest.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
School.hasMany(WelfareRequest, { foreignKey: 'schoolId', as: 'welfareRequests' });
WelfareRequest.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 7. Welfare Request Documents
WelfareRequest.hasMany(WelfareRequestDocument, { foreignKey: 'welfareRequestId', as: 'documents' });
WelfareRequestDocument.belongsTo(WelfareRequest, { foreignKey: 'welfareRequestId', as: 'request' });

// 8. Welfare Approvals (Audit Trail)
WelfareRequest.hasMany(WelfareApproval, { foreignKey: 'welfareRequestId', as: 'approvals' });
WelfareApproval.belongsTo(WelfareRequest, { foreignKey: 'welfareRequestId', as: 'request' });
User.hasMany(WelfareApproval, { foreignKey: 'approvedBy', as: 'givenApprovals' });
WelfareApproval.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// 9. Donor
User.hasOne(Donor, { foreignKey: 'userId', as: 'donorProfile' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 10. Donation
Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });
WelfareRequest.hasMany(Donation, { foreignKey: 'welfareRequestId', as: 'donations' });
Donation.belongsTo(WelfareRequest, { foreignKey: 'welfareRequestId', as: 'request' });
School.hasMany(Donation, { foreignKey: 'schoolId', as: 'directDonations' });
Donation.belongsTo(School, { foreignKey: 'schoolId', as: 'allocatedSchool' });

// 11. Transfers
WelfareRequest.hasMany(Transfer, { foreignKey: 'welfareRequestId', as: 'transfers' });
Transfer.belongsTo(WelfareRequest, { foreignKey: 'welfareRequestId', as: 'request' });
Donation.hasOne(Transfer, { foreignKey: 'donationId', as: 'transfer' });
Transfer.belongsTo(Donation, { foreignKey: 'donationId', as: 'donation' });
School.hasMany(Transfer, { foreignKey: 'schoolId', as: 'receivedTransfers' });
Transfer.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
User.hasMany(Transfer, { foreignKey: 'transferredBy', as: 'processedTransfers' });
Transfer.belongsTo(User, { foreignKey: 'transferredBy', as: 'transferredByUser' });

// 12. Resources
Teacher.hasMany(Resource, { foreignKey: 'teacherId', as: 'resources' });
Resource.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Subject.hasMany(Resource, { foreignKey: 'subjectId', as: 'resources' });
Resource.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
School.hasMany(Resource, { foreignKey: 'schoolId', as: 'resources' });
Resource.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 13. Circulars
User.hasMany(Circular, { foreignKey: 'publishedBy', as: 'publishedCirculars' });
Circular.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisher' });
Circular.hasMany(CircularRecipient, { foreignKey: 'circularId', as: 'recipients' });
CircularRecipient.belongsTo(Circular, { foreignKey: 'circularId', as: 'circular' });
Circular.hasMany(CircularAttachment, { foreignKey: 'circularId', as: 'attachments' });
CircularAttachment.belongsTo(Circular, { foreignKey: 'circularId', as: 'circular' });

// 14. Monthly Reports
School.hasMany(MonthlyReport, { foreignKey: 'schoolId', as: 'reports' });
MonthlyReport.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 15. Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    User,
    PasswordReset,
    School,
    Principal,
    Teacher,
    Subject,
    TeacherSubject,
    Student,
    WelfareRequest,
    WelfareRequestDocument,
    WelfareApproval,
    Donor,
    Donation,
    Transfer,
    Resource,
    Circular,
    CircularRecipient,
    CircularAttachment,
    MonthlyReport,
    Notification
};
