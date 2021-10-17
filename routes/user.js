const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authentication = require('../util/authentication');

router.post('/signup', authentication.verifyCredentials, userController.signup);
router.post('/login', authentication.verifyCredentials, userController.login);
router.get('/home', authentication.verifyToken, userController.home);
router.patch('/updateProfile', authentication.verifyToken, userController.updateProfile);
router.get('/profilePicture', authentication.verifyToken, userController.profilePicture);
router.get('/coverPicture', authentication.verifyToken, userController.coverPicture);
router.get('/myProfile',authentication.verifyToken, userController.myProfile);
router.get('/profile/:id',authentication.verifyToken, userController.checkProfile);

module.exports = router;
