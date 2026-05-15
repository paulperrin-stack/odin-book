const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const { getProfile, updateProfile, listUsers } = require('../controllers/userController');

const userRouter = Router();

userRouter.use(isAuthenticated);

userRouter.get('/', listUsers);
userRouter.patch('/me', updateProfile);
userRouter.get('/:username', getProfile);

module.exports = userRouter;