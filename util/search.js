const mongoose = require("mongoose");

const esclient = require('../config/searching.js');
const mongoosastic = require("mongoosastic");


const searchDoc = async function(indexName, mappingType, payload){
    return await esclient.search({
        index: indexName,
        type: mappingType,
        body: payload
    });
}

module.exports = searchDoc;
