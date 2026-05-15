require('dotenv').config();

const express = require('express');
const cors = require('cors');

const sessionMiddleware = require('./src/config/session');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
    // Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

    // Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ status: 'Error', message: 'Endpoint not found' });
});

// centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ status: 'Error', message: err.message ?? 'Internal Server Error' });
});

module.exports = app;