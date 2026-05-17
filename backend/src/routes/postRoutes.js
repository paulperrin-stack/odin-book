const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');

const postRouter = Router();
postRouter.use(isAuthenticated);

// Feed
postRouter.get('/feed', postController.getFeed);

// Post CRUD
postRouter.post('/', postController.create);
postRouter.get('/:id', postController.getById);
postRouter.delete('/:id', postController.remove);

// Likes (nested under post)
postRouter.post('/:id/like', likeController.likePost);
postRouter.delete('/:id/like', likeController.unlikePost);
postRouter.get('/:id/likes', likeController.getLikesForPost);

// Comments (nested under post)
postRouter.post('/:id/comments', commentController.createComment);
postRouter.get('/:id/comments', commentController.getCommentsForPost);

module.exports = postRouter;