const mongoose = require("mongoose");
const Post = require("../models/post");
const Profile = require("../models/profile");
const User = require("../models/user");

module.exports.postDetail= async(post) =>{
    console.log(post);
    const data= post.populate({
        path: "user",
        model: User,
        select: "-password",
        populate: { path: "profile", model: Profile },
      })
      .populate({
        path: "tagged_users",
        model: User,
        select: "-password",
        populate: { path: "profile", model: Profile },
      })
      .populate({
        path: "liked_users",
        model: User,
        select: "-password",
        populate: { path: "profile", model: Profile },
      })
      ;

      return data;

}
