const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const pool = require('../db/pool');

const PgStore = connectPgSimple(session);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const sessionMiddleware = session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
        pool: pool,
        createTableIfMissing: true,
        ttl: MAX_AGE_MS / 1000, // in seconds
    }),
    cookie: {
        httpOnly: true,
        // In production the frontend (Vercel) and backend (Render) are on
        // different domains, so the session cookie is sent cross-site.
        // Browsers only send a cross-site cookie when SameSite=None, and
        // SameSite=None requires Secure=true (HTTPS). Locally we stay on
        // 'lax' + non-secure so it works over http://localhost.
        sameSite: IS_PRODUCTION ? 'none' : 'lax',
        secure: IS_PRODUCTION,
        path: '/',
        maxAge: MAX_AGE_MS,
    },
});

module.exports = sessionMiddleware;