const { Router } = require('express');
const passport = require('passport');
const { register, login, logout, me } = require('../controllers/authController');

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', me);

authRouter.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

authRouter.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', (err, user) => {
        if (err) {
            console.error('GitHub OAuth error:', err);
            return next(err);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=github`);
        }
        req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);
            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                req.session.save((saveErr) => {
                    if (saveErr) return next(saveErr);
                    return res.redirect(`${process.env.FRONTEND_URL}/`);
                });
            });
        });
    })(req, res, next);
});

module.exports = authRouter;