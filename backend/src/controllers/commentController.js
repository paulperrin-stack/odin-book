const prisma = require('../db/prismaClient');

const createComment = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const { content } = req.body;

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: req.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        res.status(201).json({ comment });
    } catch (err) {
        next(err);
    }
};

const getCommentsForPost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const where = { postId };

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where,
                include: {
                    author: {
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

            prisma.comment.count({ where })
        ]);

        res.json({ comments, total, page, limit });
    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const commentId = Number(req.params.id);

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Could not find comment' });
        }

        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.comment.delete({
            where: { id:commentId },
        });

        res.json({ message: 'Comment deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createComment,
    getCommentsForPost,
    deleteComment
}