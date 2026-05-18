const { Router } = require('express');

const isAuthenticated = require('../middleware/isAuthenticated');
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');

const userRouter = Router();

userRouter.use(isAuthenticated);

userRouter.get('/', userController.listUsers);

userRouter.post('/:username/follow', followController.sendRequest);
userRouter.delete('/:username/follow', followController.unfollow);

userRouter.get('/:username/followers', followController.getFollowers);
userRouter.get('/:username/following', followController.getFollowing);

userRouter.patch('/me', userController.updateProfile);
userRouter.get('/:username', userController.getProfile);

module.exports = userRouter;