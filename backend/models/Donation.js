const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Donation = db.define('Donation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    donorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'donor_id'
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'school_id'
    },
    welfareRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'welfare_request_id'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('ONLINE', 'BANK_TRANSFER'),
        allowNull: false,
        field: 'payment_method'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    receiptReference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'receipt_reference'
    }
}, {
    tableName: 'donations',
    underscored: true,
    indexes: [
        {
            fields: ['status']
        }
    ]
});

module.exports = Donation;
