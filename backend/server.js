const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api');
const { getAllCoursesList, getEnrolledCourses, getManagedCourses } = require('../CRUD/crud_course');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the view and assets directories
app.use(express.static(path.join(__dirname, '../view')));
app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../js')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));

// Root route - redirect to home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/home.html'));
});

// API routes
app.use('/api', apiRoutes);

// Compatibility endpoints used by frontend scripts that call /courses directly
app.get('/courses', async (req, res) => {
    try {
        const courses = await getAllCoursesList();
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get enrolled courses for a specific user (legacy frontend may call this)
app.get('/courses/enrolled/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        const courses = await getEnrolledCourses(userID);
        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get courses managed by a specific user (owner/tutor)
app.get('/courses/managed/:ownerID', async (req, res) => {
    try {
        const { ownerID } = req.params;
        const courses = await getManagedCourses(ownerID);
        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
