const prisma = require('../db/prismaClient');

const sendRequest = async (req, res, next) => {
    try {
        const target = await prisma.user.findUnique({
            where: { username: req.params.username },
        });

        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (target.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const follow = await prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: target.id,
                }
            },
            create: {
                followerId: req.user.id,
                followingId: target.id,
                status: 'PENDING',
            },
            update: {}
        });

        res.status(201).json({ follow });
    } catch (err) {
        next(err);
    }
};

const acceptRequest = async (req, res, next) => {
    try {
        const followId = Number(req.params.id);

        const follow = await prisma.follow.findUnique({
            where: { id: followId },
        });

        if (!follow) {
            return res.status(404).json({ error: 'Follow request not found' });
        }

        if (req.user.id !== follow.followingId) {
            return res.status(403).json({error: 'Forbidden'});
        }

        if (follow.status === 'ACCEPTED') {
            return res.json({ follow });
        }

        const updatedFollow = await prisma.follow.update({
            where: { id: followId },
            data: { status: 'ACCEPTED' },
        });

        res.json({ follow: updatedFollow });

    } catch (err) {
        next(err);
    }
}

const declineRequest = async (req, res, next) => {
    try {
        const followId = Number(req.params.id);

        const follow = await prisma.follow.findUnique({
            where: { id: followId }
        });

        if (!follow) {
            return res.status(404).json({ error: 'Follow request not found' });
        }

        if (req.user.id !== follow.followingId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.follow.delete({
            where: { id: followId }
        });

        res.json({ message: 'Follow request removed' });
    } catch (err) {
        next(err);
    }
};

const unfollow = async (req, res, next) => {
    try {
        const target = await prisma.user.findUnique({
            where: { username: req.params.username },
        });

        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await prisma.follow.deleteMany({
            where: {
                followerId: req.user.id,
                followingId: target.id,
            }
        });

        res.json({ removed: result.count });
    } catch (err) {
        next(err);
    }
};

const getFollowers = async (req, res, next) => {
    try {
        const target = await prisma.user.findUnique({
            where: { username: req.params.username }
        });

        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }

        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const where = {
            followingId: target.id,
            status: 'ACCEPTED'
        };

        const [follows, total] = await Promise.all([
            prisma.follow.findMany({
                where,
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.follow.count({ where })
        ]);

        const users = follows.map(follow => follow.follower);

        res.json({ users, total, page, limit });
    } catch (err) {
        next(err);
    }
};

const getFollowing = async (req, res, next) => {
    try {
        const target = await prisma.user.findUnique({
            where: { username: req.params.username }
        });

        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }

        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const where = {
            followerId: target.id,
            status: 'ACCEPTED'
        };

        const [follows, total] = await Promise.all([
            prisma.follow.findMany({
                where,
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.follow.count({ where })
        ]);

        const users = follows.map(follow => follow.following);

        res.json({ users, total, page, limit });
    } catch (err) {
        next(err);
    }
};

const getPendingRequests = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const where = {
            followingId: req.user.id,
            status: 'PENDING'
        };

        const [requests, total] = await Promise.all([
            prisma.follow.findMany({
                where,
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.follow.count({ where })
        ]);

        res.json({ requests, total, page, limit });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    declineRequest,
    unfollow,
    getFollowers,
    getFollowing,
    getPendingRequests
};