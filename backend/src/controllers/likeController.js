const prisma = require("../db/prismaClient");

const likePost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);

        await prisma.like.upsert({
            where: {
                userId_postId: {
                    userId: req.user.id,
                    postId
                }
            },
            create: {
                userId: req.user.id,
                postId
            },
            update: {}
        });

        const total = await prisma.like.count({
            where: { postId }
        });

        res.json({ likes: total });
    } catch (err) {
        next(err);
    }
};

const unlikePost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);

        await prisma.like.deleteMany({
            where: {
                userId: req.user.id,
                postId
            }
        });

        const total = await prisma.like.count({
            where: { postId }
        });

        res.json({ likes: total });
    } catch (err) {
        next(err);
    }
};

const getLikesForPost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const where = { postId };

        const [likes, total] = await Promise.all([
            prisma.like.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true
                        }
                    }
                }
            }),

            prisma.like.count({ where })
        ]);

        const users = likes.map((like) => like.user);

        res.json({ users, total, page, limit });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    likePost,
    unlikePost,
    getLikesForPost,
};