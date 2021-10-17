const tokens = require('../util/token');

module.exports.tokenexchange = async function(req, res) {

    console.log(req.originalUrl + " Exchanging Token");

    let auth = req.headers['authorization'];
    let token = auth.split(' ')[1] ?? auth.split(' ')[0];

    let tokenPair = await tokens.getNewAccessToken(token);
    if(tokenPair.error)
        return res.status(400).json({ message: tokens.error });
        
    return res.send(tokenPair);
}