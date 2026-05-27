const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Submission = require('./models/Submission');

// Load environment variables (local only)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Local in-memory mock database cache for offline fallback
let mockSubmissions = [];
let mockIdCounter = 1;

const app = express();

// Set default JWT Secret and Admin Credentials
const JWT_SECRET = process.env.JWT_SECRET || 'shecan_jwt_secret_token_key_123';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'shecanadmin123';

// Connect Database
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets locally
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

// Middleware to authenticate Admin JWT in Cookie
const authAdmin = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// Submit Volunteer Application Form
app.post('/api/join', async (req, res) => {
    try {
        const { name, email, role, message } = req.body;

        // Server-Side Validations
        if (!name || name.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'Name must be at least 3 characters' });
        }
        
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
        }

        const validRoles = ['advocacy', 'outreach', 'training', 'fundraising'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: 'Please select a valid area of interest' });
        }

        if (!message || message.trim().length < 10 || message.trim().length > 500) {
            return res.status(400).json({ success: false, error: 'Message must be between 10 and 500 characters' });
        }

        // Save to Database (or mock if database is offline)
        if (mongoose.connection.readyState === 1) {
            const newSubmission = new Submission({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                role,
                message: message.trim()
            });
            await newSubmission.save();
        } else {
            console.log('⚠️ Database connection offline. Storing registration in-memory mockup.');
            mockSubmissions.push({
                _id: `mock_${mockIdCounter++}`,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                role,
                message: message.trim(),
                createdAt: new Date()
            });
        }
        res.status(200).json({ success: true, message: 'Form Submitted Successfully' });

    } catch (err) {
        console.error('Submit API Error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error. Please try again later.' });
    }
});

/* ==========================================================================
   ADMIN & AUTHENTICATION API ENDPOINTS
   ========================================================================== */

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all login details' });
    }

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
        // Issue Secure stateless JWT Token
        const token = jwt.sign({ username: ADMIN_USER }, JWT_SECRET, { expiresIn: '2h' });

        // Set JWT inside secure HttpOnly Cookie (1 day expiry)
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.json({ success: true, message: 'Login successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Check Admin Authentication Status
app.get('/api/admin/check', (req, res) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.json({ authenticated: false });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return res.json({ authenticated: true });
    } catch (err) {
        return res.json({ authenticated: false });
    }
});

// Fetch Submissions (Protected)
app.get('/api/admin/submissions', authAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const list = await Submission.find().sort({ createdAt: -1 });
            res.json({ success: true, submissions: list });
        } else {
            console.log('⚠️ Database offline: Fetching registrations from in-memory mockup.');
            const list = [...mockSubmissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            res.json({ success: true, submissions: list });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to retrieve registrations' });
    }
});

// Delete Submission (Protected)
app.delete('/api/admin/submissions/:id', authAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (mongoose.connection.readyState === 1 && !id.startsWith('mock_')) {
            const submission = await Submission.findById(id);
            if (!submission) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            await Submission.findByIdAndDelete(id);
        } else {
            console.log(`⚠️ Database offline/Mock ID: Deleting registration ${id} from in-memory mockup.`);
            mockSubmissions = mockSubmissions.filter(sub => sub._id !== id);
        }
        
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete record' });
    }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

/* ==========================================================================
   STATIC HTML SERVING (For local Dev - fallback)
   ========================================================================== */
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, '../join.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../about.html'));
});
app.get('/initiatives', (req, res) => {
    res.sendFile(path.join(__dirname, '../initiatives.html'));
});
app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, '../donate.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Catch-all route to serve static files
app.use(express.static(path.join(__dirname, '../')));

module.exports = app;
