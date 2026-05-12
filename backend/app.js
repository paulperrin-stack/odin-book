const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ status: 'Error', message: 'Not found' });
});

// centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ status: 'Error', message: err.message || 'Internal Server Error' });
});

module.exports = app;