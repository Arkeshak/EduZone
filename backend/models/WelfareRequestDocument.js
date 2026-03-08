const { DataTypes } = require('sequelize');
const db = require('../config/db');

const WelfareRequestDocument = db.define('WelfareRequestDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    welfareRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'welfare_request_id'
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'file_url'
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'uploaded_at'
    }
}, {
    tableName: 'welfare_request_documents',
    underscored: true,
    timestamps: false
});

module.exports = WelfareRequestDocument;
