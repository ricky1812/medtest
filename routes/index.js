const express = require('express');
const router = express.Router();

const authentication = require('../util/authentication');
const tokenController = require('../controllers/tokenController');

router.get('', authentication.verifyToken, function(req,res) {
    console.log(req.originalUrl + " Homepage");
    res.send(`This will be the home page`);
});

router.post('/tokenexchange', authentication.verifyRefreshToken, tokenController.tokenexchange);

router.use('/user', require('./user'));
router.use('/user', require('./connection'));
router.use('/', require('./post'));

module.exports = router;
console.log("Router Loaded");