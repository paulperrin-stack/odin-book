const prisma = require('../db/prismaClient');

const getFeed = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const where = {
            OR: [
                { authorId: req.user.id },
                {
                    author: {
                        followers: {
                            some: {
                                followerId: req.user.id,
                                status: 'ACCEPTED'
                            }
                        }
                    }
                }
            ]
        };

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.post.count({ where })
        ]);

        res.json({ posts, total, page, limit });
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const { content } = req.body;

        const post = await prisma.post.create({
            data: {
                content,
                authorId: req.user.id
            }
        });

        res.status(201).json({ post });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ post });
    } catch (err) {
        next(err);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        
        const where = {
            author: {
                username: req.params.username
            }
        };

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.post.count({ where })
        ]);

        res.json({ posts, total, page, limit });
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.post.delete({
            where: { id: post.id }
        });

        res.json({ message: 'Post deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFeed,
    create,
    getById,
    getByUser,
    remove,
};