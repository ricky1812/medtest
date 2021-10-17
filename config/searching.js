var elasticsearch=require('elasticsearch');

const ELASTIC_URL = process.env.ELASTIC_URL;

var client = new elasticsearch.Client( {  
  hosts: [
    ELASTIC_URL,
  ]
});

module.exports = client;  