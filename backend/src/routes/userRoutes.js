const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const { getProfile, updateProfile, listUsers } = require('../controllers/userController');
const { getByUser } = require('../controllers/postController');

const userRouter = Router();

userRouter.use(isAuthenticated);

userRouter.get('/', listUsers);
userRouter.patch('/me', updateProfile);
userRouter.get('/:username', getProfile);
userRouter.get('/:username/posts', getByUser);

module.exports = userRouter;