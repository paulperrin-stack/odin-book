const { Router } = require("express");

const isAuthenticated = require("../middleware/isAuthenticated");
const { deleteComment } = require("../controllers/commentController");

const commentRouter = Router();

commentRouter.use(isAuthenticated);

commentRouter.delete('/:id', deleteComment);

module.exports = commentRouter;