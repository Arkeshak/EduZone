/**
 * EDUZONE BACKEND SERVER
 * 
 * Main Express server entry point
 * Handles:
 * - Middleware configuration (security, validation, auth)
 * - Route setup
 * - Database connection
 * - Error handling
 * - Server startup
 */

const express = require('express');        // Web framework
const cors = require('cors');              // Handle cross-origin requests
const dotenv = require('dotenv');          // Load environment variables
const path = require('path');              // Path utilities
const helmet = require('helmet');          // Set security headers
const rateLimit = require('express-rate-limit');  // Prevent abuse
const { sequelize } = require('./models'); // Sequelize instance for DB
const { ALLOWED_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, IS_PRODUCTION, SECURITY_HEADERS_ENABLED } = require('./config/constants');
const { sanitizeInput } = require('./middleware/sanitization');
const { asyncHandler, errorHandler } = require('./middleware/errorHandler');

// ✅ Load environment variables from .env file
// Sets: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DB_NAME, EMAIL_USER, etc.
dotenv.config();

// ✅ Create Express app
const app = express();

/**
 * MIDDLEWARE 1: HELMET - SECURITY HEADERS
 * 
 * Purpose: Set HTTP security headers to prevent common attacks
 * - Prevents clickjacking (X-Frame-Options)
 * - Prevents MIME sniffing (X-Content-Type-Options)
 * - Enforces HTTPS (HSTS)
 * - Content Security Policy (CSP) restricts script sources
 */
app.use(helmet({
    crossOriginResourcePolicy: false,  // Allow cross-origin resources (e.g., images)
    contentSecurityPolicy: process.env.CSP_ENABLED !== 'false' ? {
        directives: {
            defaultSrc: ["'self'"],                    // Only allow resources from own domain
            scriptSrc: ["'self'", "'unsafe-inline'"],  // Allow inline scripts (for dev)
            styleSrc: ["'self'", "'unsafe-inline'"],   // Allow inline styles
            imgSrc: ["'self'", "data:", "https:"],     // Allow images from self, data URIs, https
            connectSrc: ["'self'", "https:"],          // Allow API calls to self and https
            frameSrc: ["'self'"],                      // Only embed frames from own domain
            objectSrc: ["'none'"]                      // Disable plugins
        }
    } : false,
    hsts: {
        maxAge: 31536000,              // 1 year
        includeSubDomains: true,       // Apply to subdomains
        preload: true                  // Include in browser's preload list
    }
}));

/**
 * MIDDLEWARE 2: CORS - CROSS-ORIGIN REQUESTS
 * 
 * Purpose: Allow frontend to make requests to this backend
 * Only specified origins (domains) are allowed
 * Prevents malicious websites from calling our API
 */
app.use(cors({
    origin: ALLOWED_ORIGINS,                          // Allowed domains from config
    credentials: true,                                // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed request headers
    maxAge: 86400                                      // Cache CORS preflight 24 hours
}));

/**
 * MIDDLEWARE 3: BODY PARSER - PARSE REQUEST BODY
 * 
 * Purpose: Convert JSON and form data to JavaScript objects
 * Limit 10MB to prevent huge payloads (DoS protection)
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * MIDDLEWARE 4: INPUT SANITIZATION
 * 
 * Purpose: Clean malicious content from user inputs
 * Example: Remove or escape <script> tags
 */
app.use(sanitizeInput);

/**
 * MIDDLEWARE 5: RATE LIMITING
 * 
 * Purpose: Prevent abuse by limiting requests per IP
 * - Max X requests per Y minutes
 * - Disabled in development (would interfere with testing)
 * - Enabled in production (protects against DDoS)
 */
const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,          // e.g., 15 minutes
    max: RATE_LIMIT_MAX_REQUESTS,            // e.g., 60 requests
    standardHeaders: true,                   // Return rate limit info in headers
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later" },
    skip: (req) => !IS_PRODUCTION             // Skip in development
});
app.use('/api', apiLimiter);  // Apply to /api routes only

/**
 * MIDDLEWARE 6: REQUEST LOGGER
 * 
 * Purpose: Log every request (useful for debugging and monitoring)
 * Shows: HTTP method, URL path, timestamp
 */
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

/**
 * ROUTE SETUP
 * 
 * Maps URL paths to their corresponding route handlers
 * Organizes API into logical domains:
 * - /api/auth - Authentication (login, register, verify)
 * - /api/schools - School management
 * - /api/welfare - Welfare requests lifecycle
 * - /api/donations - Donation management
 * - /api/resources - Educational resources
 * - /api/circulars - Announcements
 * - /api/reports - Reports
 * - /api/transfers - Fund transfers
 */

// ✅ Serve uploaded files (images, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Auth routes (public: register, verify, login)
app.use('/api/auth', require('./routes/authRoutes'));

// ✅ School routes (protected: get schools, my school)
app.use('/api/schools', require('./routes/schoolRoutes'));

// ✅ Welfare routes (core business: request management)
app.use('/api/welfare', require('./routes/welfareRoutes'));
app.use('/api/welfare-types', require('./routes/welfareTypeRoutes'));

// ✅ Donation routes (collecting funds)
app.use('/api/donations', require('./routes/donationRoutes'));

// ✅ Resource routes (sharing educational material)
app.use('/api/resources', require('./routes/resourceRoutes'));

// ✅ Circular routes (announcements)
app.use('/api/circulars', require('./routes/circularRoutes'));

// ✅ Report routes (analytics)
app.use('/api/reports', require('./routes/reportRoutes'));

// ✅ Transfer routes (moving funds)
app.use('/api/transfers', require('./routes/transferRoutes'));

/**
 * HEALTH CHECK ENDPOINTS
 */

// ✅ Root endpoint (verify server is running)
app.get("/", (req, res) => {
    res.send("EduZone Backend Running 🚀");
});

// ✅ Health check (for monitoring/uptime)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * 404 HANDLER
 * 
 * Purpose: Catch requests to non-existent endpoints
 * Should be before error handler
 */
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

/**
 * ERROR HANDLER (Must be LAST)
 * 
 * Purpose: Centralized error handling
 * Catches all errors from routes and middleware
 * Formats error response consistently
 */
app.use(errorHandler);

/**
 * DATABASE CONNECTION & SERVER STARTUP
 */

// ✅ Only connect to database if not in test mode (tests use separate DB)
if (process.env.NODE_ENV !== 'test') {
    /**
     * Authenticate with database
     * Calls: SELECT 1 (verifies connection and credentials)
     */
    sequelize.authenticate()
        .then(() => {
            console.log('Database connected successfully...');
            // ✅ Synchronize models with database
            // In development, this creates tables if they don't exist
            return sequelize.sync().then(async () => {
                console.log('Database models synchronized.');
                
                // ✅ Auto-seed default welfare types if table is empty
                const { WelfareType } = require('./models');
                const count = await WelfareType.count();
                if (count === 0) {
                    console.log('Seeding default welfare types...');
                    const defaults = ['Books', 'Uniforms', 'Fees', 'Equipment', 'Medical', 'Transport', 'Meals', 'Other'];
                    await WelfareType.bulkCreate(defaults.map(name => ({ name, isActive: true })));
                    console.log('Default welfare types seeded.');
                }
            });
        })
        .catch(err => console.log('Database Error: ' + err));
}

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
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
