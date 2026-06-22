const passport = require('passport');

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GitHubStrategy } = require('passport-github2');

const bcrypt = require('bcryptjs');
const prisma = require('../db/prismaClient');

passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase().trim() },
                });
                if (!user || !user.passwordHash) {
                    return done(null, false, {
                        message: 'Invalid email or password.',
                    });
                }
                const passwordMatch = await bcrypt.compare(
                    password,
                    user.passwordHash
                );
                if (!passwordMatch) {
                    return done(null, false, {
                        message: 'Invalid email or password.',
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Only register the GitHub strategy if OAuth credentials are present.
// This lets the app run in environments (e.g. first deploy) where GitHub
// OAuth hasn't been configured yet — email/password login still works.
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
                scope: ['user:email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const githubId = String(profile.id);

                    // Always have a username. GitHub usually provides `profile.username`
                    // (the login), but fall back so the column is never null —
                    // null usernames break profile links and the UI.
                    const fallbackUsername = `gh_${githubId}`;

                    const existingByGitHub = await prisma.user.findUnique({
                        where: { githubId },
                    });
                    if (existingByGitHub) {
                        return done(null, existingByGitHub);
                    }

                    const email =
                        profile.emails?.[0]?.value?.toLowerCase().trim() ?? null;

                    if (email) {
                        const existingByEmail = await prisma.user.findUnique({
                            where: { email },
                        });
                        if (existingByEmail) {
                            const linked = await prisma.user.update({
                                where: { id: existingByEmail.id },
                                data: {
                                    githubId,
                                    username:
                                        existingByEmail.username ??
                                        profile.username ??
                                        fallbackUsername,
                                    displayName:
                                        existingByEmail.displayName ??
                                        profile.displayName ??
                                        profile.username ??
                                        null,
                                    avatarUrl:
                                        existingByEmail.avatarUrl ??
                                        profile.photos?.[0]?.value ??
                                        null,
                                },
                            });
                            return done(null, linked);
                        }
                    }

                    const created = await prisma.user.create({
                        data: {
                            githubId,
                            email,
                            username: profile.username ?? fallbackUsername,
                            displayName:
                                profile.displayName ?? profile.username ?? null,
                            avatarUrl: profile.photos?.[0]?.value ?? null,
                        },
                    });
                    return done(null, created);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;