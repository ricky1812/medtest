const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL;
mongoose.connect(DB_URL, { useNewUrlParser: true,  useUnifiedTopology: true});


const db = mongoose.connection;

db.on('error', console.error.bind(console, " Error connecting to database"));
db.once('open', function() {
    console.log("Connected to Database: " + DB_URL);
});