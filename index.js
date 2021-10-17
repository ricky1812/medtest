require('dotenv').config();
const express = require('express');
const app = express();
const path= require('path');


const PORT = process.env.SERVER_PORT;
const db = require('./config/mongoose');





app.use(express.json())
.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");

    next();
});

//Deployment
/* 
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html');)
});

*/

app.use('/v1', require('./routes/index'));

app.listen(PORT, (error) => {
    if(error)
        console.log("Error in starting server: ", error);
    else
        console.log("Server listening on PORT: " + PORT);
})