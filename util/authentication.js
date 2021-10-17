const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const tokens = require('./token');

const JsonWebTokenError = jwt.JsonWebTokenError;
const TokenExpiredError = jwt.TokenExpiredError;
const _tokenIssueTime = tokens._tokenIssueTime;
const ACCESS_SECRET = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET = process.env.REFRESH_SECRET_KEY;

module.exports.verifyCredentials = function(req, res, next) {
    console.log(req.originalUrl + "  Verifying Credentials");

    let auth = req.headers['authorization'];
    if(!auth)
        return res.sendStatus(401);
    
    let authType = auth.split(' ')[0];
    if(authType != "Basic")
    {
        res.status(401);
        return res.send();
    }

    let credentials = Buffer.from(auth.split(' ')[1], 'base64').toString('ascii');
    let username = credentials.substring(0, credentials.indexOf(':'));
    let password = credentials.substring(credentials.indexOf(':') + 1, credentials.length);

    if(!username || !password)
        return res.sendStatus(401);

    console.log("Credentials Verified");
    next();
}

module.exports.verifyToken = async function(req, res, next) {
    console.log(req.originalUrl + " Verifying Access Token");

    let authHeader = req.headers['authorization'];
    if(authHeader)
    {
        let authTypeOrToken = authHeader.split(' ')[0];
        if(authTypeOrToken == "Basic")
            return res.sendStatus(401);

        let token = authHeader.split(' ')[1] ?? authTypeOrToken;
        
        try {
            let decoded = jwt.verify(token, ACCESS_SECRET);
            req.userId=decoded._id;
            let userId = decoded._id
            if(!_tokenIssueTime[userId] || _tokenIssueTime[userId] == -1) {
                if(!_tokenIssueTime[userId])
                    console.log("No access token generated yet");
                else
                    console.log("Token invalidated due to multiple use of refresh token");
                return res.status(400).json({ message: "Session Expired. Login again" });
            }
            if(decoded.type != "access") {
                console.log("Invalid token type");
                return res.status(400).json({ message: "Invalid Token" });
            }
            
            let user = await User.findOne({ _id: userId});
            if(!user) {
                console.log("No user corresponding to id in token");
                return res.status(400).json({message: "Invalid Token"});
            }
            req.userId = decoded._id;
        }
        catch(e) {
            if(e instanceof TokenExpiredError) {
                console.log("Token expired");
                return res.status(401).json({ message: "Session Expired. Login again" });
            }
            if(e instanceof JsonWebTokenError) {
                console.log("Error in token decryption");
                return res.status(401).json({ message: "Invalid Token" });
            }
            console.log(e);
            return res.status(400).json({error: e});
        }

        console.log("Access Token Verified");
        next();
    }
    else
        res.sendStatus(401);
}

module.exports.verifyRefreshToken = async function(req, res, next) {

    console.log(req.originalUrl + " Verifying Refresh Token");

    let authHeader = req.headers['authorization'];
    if(authHeader)
    {
        let authTypeOrToken = authHeader.split(' ')[0];
        if(authTypeOrToken == "Basic")
            return res.sendStatus(401);

        let token = authHeader.split(' ')[1] ?? authTypeOrToken;

        try {
            let decoded = jwt.verify(token, REFRESH_SECRET);
            let userId = decoded._id;
            
            if(!_tokenIssueTime[userId] || _tokenIssueTime[userId] == -1) {
                if(!_tokenIssueTime[userId])
                    console.log("No access token generated yet");
                else
                    console.log("Token invalidated due to multiple use of refresh token");
                return res.status(400).json({ message: "Session Expired. Log in again" });
            }
            if(decoded.iat < _tokenIssueTime[userId]) {
                //This referesh token has already been used
                _tokenIssueTime[userId] = -1;
                console.log("Token invalidated due to multiple use of refresh token");
                return res.status(400).json({ message: "Session Expired. Log in again" });
            }
            if(decoded.type != "refresh") {
                console.log("Invalid token type");
                return res.status(400).json({ message: "Invalid Token" });
            }

            let user = await User.findOne({ _id: userId });
            if(!user) {
                console.log("No user corresponding to id in token");
                return res.status(400).json({ message: "Invalid Token" });   
            }
            req.userId = decoded._id;
        }
        catch(e) {
            if(e instanceof TokenExpiredError) {
                console.log("Token expired");
                return res.status(401).json({ message: "Session Expired. Login again" });
            }
            if(e instanceof JsonWebTokenError) {
                console.log("Error in token decryption");
                return res.status(400).json({ message: "Invalid Token" });
            }
            console.log(e);
            return res.status(500).json({ error: e.message });
        }

        console.log("Refresh Token Verified");
        next();
    }
    else
        return res.sendStatus(401);
}