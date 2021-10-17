const express = require('express');

const router = express.Router();
const reqController = require('../controllers/reqController');
const authentication = require('../util/authentication');



router.get('/friends', authentication.verifyToken, reqController.friends);
router.post('/send_request', authentication.verifyToken, reqController.send_request);
router.post('/accept_request', authentication.verifyToken, reqController.accept_request);
router.get('/pending_request',authentication.verifyToken, reqController.pending_requests);
router.get('/search_friends', authentication.verifyToken, reqController.search_friends);


module.exports = router;
