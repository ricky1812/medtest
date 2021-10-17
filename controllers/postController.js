const mongoose = require("mongoose");

const bucket = require("../util/bucket");
const pagination = require("../util/pagination");

const User = require("../models/user");
const Post = require("../models/post");
const Profile = require("../models/profile");
const PostSerializer=require("../serializers/postSerializer");

module.exports.posts = async function (req, res) {
  const curr_user = await User.findById(req.userId);
  var arr = await User.find({ _id: { $in: req.body["tagged_users"] } }).exec();

  let post = new Post(
    Object.assign(
      { _id: new mongoose.Types.ObjectId() },
      req.body,
      { user: curr_user },
      { tagged_users: arr }
    )
  );
  

  await post.save();
  return res.send(post);
};

module.exports.image_url = async function (req, res) {
  const post_id = req.params.id;
  const post = await Post.findById(post_id);
  console.log(post.user);
  let filename = `posts/${post.user}/${post_id}`;
  let urls = await bucket.imageUpload(filename);

  return res.send(urls);
};

module.exports.get_posts = async function (req, res) {
  const curr_user = await User.findById(req.userId);
  const PageNumber = Number(req.query.PageNumber);

  const PageSize = Number(req.query.PageSize);

  const posts = await Post.find({
    $or: [{ user: curr_user }, { tagged_users: curr_user }],
  }).sort({updatedAt: -1})
    .populate({
      path: "user",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "tagged_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "liked_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .exec();
  const result = await pagination.paginate(posts, PageNumber);
  const data = { count: posts.length, posts: result };

  return res.send(data);
};

module.exports.retrieve_post = async function (req, res) {
  const post_id = req.params.id;
  try{
  const post1 = await Post.findOne({ _id: post_id });
  const post = await Post.findOne({ _id: post_id }).populate({
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
  const data= await PostSerializer.postDetail(post1);
  return res.send(data);
  //const data= post
  }
 catch(e){
   //console.log(e);
   return res.send(e.message);
 };
};

module.exports.update_post = async function (req, res) {
  const post_id = req.params.id;
  var updateObject = req.body;
  const post = await Post.findById(post_id).exec();
  const curr_user = await User.findById(req.userId);
  if (post.user._id != req.userId) {
    return res.status(403).send("Forbidden");
  }

  if (!post) return res.status(400).send("Post Does Not Exists");

  let query = { $set: {} };

  for (let key in req.body) {
    if (post[key] && post[key] !== req.body[key]) {
      query.$set[key] = req.body[key];
    }
  }
  if (req.body["tagged_users"]) {
    var arr = await User.find({
      _id: { $in: req.body["tagged_users"] },
    }).exec();
    query.$set["tagged_users"] = arr;
  }

  const updatedPost = await Post.updateOne({ _id: req.params.id }, query);

  const final_post = await Post.findById(post_id)
    .populate({
      path: "tagged_users",
      model: User,
      select: { first_name: 1, last_name: 1 },
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "liked_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
       
      },
    })
    .populate({
      path: "user",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
       
      },
    })
    .exec();

  res.send(final_post);
};

module.exports.my_posts = async function (req, res) {
  const curr_user = await User.findById(req.userId);
  const PageNumber = Number(req.query.PageNumber);

  const PageSize = Number(req.query.PageSize);

  const posts = await Post.find({ user: curr_user })
    .populate({
      path: "user",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "tagged_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "liked_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .exec();
  const result = await pagination.paginate(posts, PageNumber);
  const data = { count: posts.length, posts: result };

  return res.send(data);
};

module.exports.like_post = async function (req, res) {
  try {
    const curr_user = await User.findById(req.userId);
    const post_id = req.query.id;
    const post = await Post.findOne({ _id: post_id });

    const val = post.liked_users.includes(req.userId);

    if (!post.liked_users.includes(req.userId)) {
      post.likes = post.likes + 1;
      post.liked_users.push(curr_user);
      await post.save();
    }
    else
    {
      post.liked_users.pull(req.userId);
      post.likes= post.likes-1;
      await post.save();
    }
    return res.send(post);
  } catch (e) {
    console.log(e);
    return res.send(e);
  }
};

module.exports.all_posts = async function (req, res) {
  const curr_user = await User.findById(req.userId);
  const PageNumber = Number(req.query.PageNumber);

  const PageSize = Number(req.query.PageSize);

  const posts = await Post.find().sort({updatedAt: -1})
    .populate({
      path: "user",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "tagged_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .populate({
      path: "liked_users",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        
      },
    })
    .exec();
  const result = await pagination.paginate(posts, PageNumber);
  const data = { count: posts.length, posts: result };

  return res.send(data);
};
