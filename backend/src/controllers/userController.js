const prisma = require('../db/prismaClient');

const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
        where: { username: req.params.username },
        include: {
            _count: {
                select: { posts: true, followers: true, following: true }
            }
        }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { displayName, avatarUrl } = req.body;

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
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
            }
        });

        res.json({ users, page, limit });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, updateProfile, listUsers };