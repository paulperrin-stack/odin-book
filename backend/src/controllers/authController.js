const bcrypt = require('bcryptjs');
const passport = require('passport');
const prisma = require('../db/prismaClient');

// Helpers

function safeUser(user) {
    const { password, ...rest } = user;
    return rest;
}

function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'Error', message: 'Email and password are required.' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ status: 'Error', message: 'Invalid email format.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ status: 'Error', message: 'Password must be at least 8 characters long.' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Duplicate check
        const existing = await prisma.user.findUnique({ 
            where: { email: normalizedEmail } 
        });
        if (existing) {
            return res.status(409).json({ message: 'Email is already registered.' }); 
        }
        
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: passwordHash,
            },
        });

        return res.status(201).json({ user: safeUser(user) });
    } catch (err) {
        next(err);
    }
};

// Login

const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({ error: info?.message ?? 'Invalid credentials.' });
        }

        req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);

            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                return res.json({ user: safeUser(user) });
            });
        });
    })(req, res, next);
};

// Logout

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((destroyErr) => {
            if (destroyErr) return next(destroyErr);
            res.clearCookie('sid', { path: '/' });
            return res.json({ message: 'Logged out' });
        });
    });
};

// Me

const me = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: safeUser(req.user) });
};

module.exports = { register, login, logout, me };