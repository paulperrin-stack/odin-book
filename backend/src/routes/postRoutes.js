const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/isAuthenticated');
const postController = require('../controllers/postController');

router.use(isAuthenticated);

router.get('/feed', postController.getFeed);
router.post('/', postController.create);

router.get('/:id', postController.getById);
router.delete('/:id', postController.remove);

module.exports = router;