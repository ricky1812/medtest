const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const esclient = require('../config/searching.js');
const mongoosastic = require("mongoosastic");

const userProfile = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  first_name: {
    type: String,
    required: true,
    es_indexed: true 
  },
  last_name: {
    type: String,
    
    es_indexed: true 
  },
  title: Schema.Types.String,
  image: {
    type: String,
    es_indexed: true,
    
  },
  cover_image: {
    type: String,
    es_indexed: true,
    
  },
  location: Schema.Types.String,
  email: {
    type: String,
    unique: true,
    es_indexed: true 
  },
  phone_number: Schema.Types.Number,
  academic_qualification: Schema.Types.String,
  exprience: Schema.Types.String,
  bio: Schema.Types.String,
  about: Schema.Types.String,
  type: Schema.Types.Boolean,
  interest: [Schema.Types.String],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
  ],
  sent_requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friend_requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userProfile.plugin(mongoosastic, {
  esClient: esclient
});

const profile = mongoose.model("profile", userProfile);

profile.createMapping((err, mapping) => {
  console.log('profile mapping created');
});
module.exports = profile;
