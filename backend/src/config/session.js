const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const pool = require('../db/pool');

const PgStore = connectPgSimple(session);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 day

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
        sameSite: 'lax',
        secure: IS_PRODUCTION,
        path: '/',
        maxAge: MAX_AGE_MS,
    },
});

module.exports = sessionMiddleware;