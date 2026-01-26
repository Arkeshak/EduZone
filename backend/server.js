const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // Import from central index

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes')); // New School Routes
app.use('/api/welfare', require('./routes/welfareRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/circulars', require('./routes/circularRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Database Sync
sequelize.sync() // { force: true } to reset
    .then(() => console.log('Database connected and synced...'))
    .catch(err => console.log('Error: ' + err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
