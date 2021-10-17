const mongoose = require("mongoose");
const User = require("./user");

const PostSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  body: {
    type: String,
    required: true,
  },

  image_url: [
    {
      type: String,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    immutable: true,
  },
  tagged_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  liked_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
},
{timestamps: true});

const post = mongoose.model("post", PostSchema);
module.exports = post;
