const { Router } = require('express');

const isAuthenticated = require('../middleware/isAuthenticated');
const {
    getPendingRequests,
    acceptRequest,
    declineRequest
} = require('../controllers/followController');

const followRouter = Router();

followRouter.use(isAuthenticated)

followRouter.get('/pending', getPendingRequests);
followRouter.post('/:id/accept', acceptRequest);
followRouter.delete('/:id', declineRequest);

module.exports = followRouter;