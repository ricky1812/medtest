const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const ACCESS_SECRET = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET = process.env.REFRESH_SECRET_KEY;
const ACCESS_VALID_SECONDS = parseInt(process.env.ACCESS_VALID_SECONDS);
const REFRESH_VALID_SECONDS = parseInt(process.env.REFRESH_VALID_SECONDS);

let _tokenIssueTime = [];
module.exports._tokenIssueTime = _tokenIssueTime;

module.exports.getAccessAndRefreshTokens = async function(user) {

    let access = jwt.sign({ 
        _id: user._id.toString(),
        type: "access"
    }, ACCESS_SECRET, { expiresIn: ACCESS_VALID_SECONDS });

    let refresh = jwt.sign({ 
        _id: user._id.toString(),
        type: "refresh"
    }, REFRESH_SECRET, { expiresIn: REFRESH_VALID_SECONDS });

    _tokenIssueTime[user._id.toString()] = Math.floor(Date.now()/1000);
    
    return {
        access: access,
        refresh: refresh,
        id: user._id.toString(),
    };
}

module.exports.getNewAccessToken = async function(refresh) {

    let decodedRefresh = jwt.verify(refresh, REFRESH_SECRET);
    let userId = decodedRefresh._id;

    let newRefresh = jwt.sign({
        _id: userId,
        type: "refresh"
    }, REFRESH_SECRET, { expiresIn: REFRESH_VALID_SECONDS });
    let newAccess = jwt.sign({ 
        _id: userId,
        type: "access"
    }, ACCESS_SECRET, { expiresIn: ACCESS_VALID_SECONDS});

    _tokenIssueTime[userId] = Math.floor(Date.now()/1000);

    return {
        access: newAccess,
        refresh: newRefresh
    }
}