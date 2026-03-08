const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models'); // Import from central index

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // allow images to be loaded cross origin
}));
app.use(cors({
    origin: "https://eduzone-backend-etd0hfbqapg8dffs.eastasia-01.azurewebsites.net"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom XSS Sanitizer for req.body only
const sanitizeBody = (obj) => {
    if (!obj) return;
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeBody(obj[key]);
        }
    }
};
app.use((req, res, next) => {
    if (req.body) sanitizeBody(req.body);
    next();
});

// Global Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use('/api', apiLimiter);

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes')); // New School Routes
app.use('/api/welfare', require('./routes/welfareRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/circulars', require('./routes/circularRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));

app.get("/", (req, res) => {
    res.send("EduZone Backend Running on Azure 🚀");
});

// Database Connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully...'))
    .catch(err => console.log('Database Connection Error: ' + err));

// Error handler
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    // Default error status and message
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Handle specific Sequelize errors securely
    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }

    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1)); // Depending on process manager (PM2), we may or may not exit here immediately
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
