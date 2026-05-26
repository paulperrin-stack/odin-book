const prisma = require('../db/prismaClient');

const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.params.username },
            include: {
                _count: {
                    select: { posts: true, followers: true, following: true },
                },
                followers: {
                    where: { followerId: req.user.id },
                    select: { status: true },
                },
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const { passwordHash, followers, ...safeUser } = user;

        res.json({
            ...safeUser,
            followStatus: followers[0]?.status ?? null,
        });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { displayName, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { displayName, avatarUrl },
        });

        const { passwordHash, ...safe } = user;
        res.json({ user: safe });
    } catch (err) {
        next(err);
    }
};

const listUsers = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const users = await prisma.user.findMany({
            where: { id: { not: req.user.id } },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                followers: {
                    where: { followerId: req.user.id },
                    select: { status: true },
                },
            },
        });

        const shaped = users.map(({ followers, ...u }) => ({
            ...u,
            followStatus: followers[0]?.status ?? null,
        }));

        res.json({ users: shaped, page, limit });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, updateProfile, listUsers };