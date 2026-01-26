const sequelize = require('../config/db');

// Import Models
const User = require('./User');
const School = require('./School');
const Teacher = require('./Teacher');
const Principal = require('./Principal');
const Donor = require('./Donor');
const WelfareRequest = require('./WelfareRequest');

// --- Associations ---

// 1. User & Profiles
User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Principal, { foreignKey: 'userId', as: 'principalProfile', onDelete: 'CASCADE' });
Principal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Donor, { foreignKey: 'userId', as: 'donorProfile', onDelete: 'CASCADE' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. Donations (Linked to Donor Profile)
// Ideally Donation belongs to a Donor Profile, not just a User.
Donor.hasMany(require('./Donation'), { foreignKey: 'donorId', as: 'donations' });
require('./Donation').belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

// 2. Staff & School
School.hasMany(Teacher, { foreignKey: 'schoolId', as: 'teachers' });
Teacher.belongsTo(School, { foreignKey: 'schoolId', as: 'schoolData' });

School.hasOne(Principal, { foreignKey: 'schoolId', as: 'principal' });
Principal.belongsTo(School, { foreignKey: 'schoolId', as: 'schoolData' });

// 3. Circulars (ZEO creates)
// User (ZEO) -> Circulars
User.hasMany(require('./Circular'), { foreignKey: 'authorId', as: 'authoredCirculars' });
require('./Circular').belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 4. Reports (Principal creates, linked to School)
School.hasMany(require('./MonthlyReport'), { foreignKey: 'schoolId', as: 'reports' });
require('./MonthlyReport').belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

Principal.hasMany(require('./MonthlyReport'), { foreignKey: 'principalId', as: 'submittedReports' });
require('./MonthlyReport').belongsTo(Principal, { foreignKey: 'principalId', as: 'principal' });

// 3. Resources (Teacher uploads, linked to School)
Teacher.hasMany(require('./Resource'), { foreignKey: 'teacherId', as: 'resources' });
require('./Resource').belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

School.hasMany(require('./Resource'), { foreignKey: 'schoolId', as: 'resources' });
require('./Resource').belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// 3. Welfare Requests
// Request belongs to a Teacher (Creator)
Teacher.hasMany(WelfareRequest, { foreignKey: 'teacherId', as: 'requests' });
WelfareRequest.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// Request belongs to a School (Context)
School.hasMany(WelfareRequest, { foreignKey: 'SchoolId' });
WelfareRequest.belongsTo(School, { foreignKey: 'SchoolId', as: 'schoolData' });

// Request Approvals (Tracked by Principal ID -> User ID? Or Principal Profile ID?)
// Let's track by Principal Profile ID for strictness, or User ID.
// For simplicity in refactor, keeping it generic or using Principal Profile.
// WelfareRequest.belongsTo(Principal, { foreignKey: 'approvedByPrincipalId', as: 'approver' });

// Export everything
module.exports = {
    sequelize,
    User,
    School,
    Teacher,
    Principal,
    Donor,
    WelfareRequest,
    Resource: require('./Resource'),
    Circular: require('./Circular'),
    MonthlyReport: require('./MonthlyReport')
};
