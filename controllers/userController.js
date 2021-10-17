const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const validatePhoneNumber = require("validate-phone-number-node-js");
const path = require("path");

const User = require("../models/user");
const Profile = require("../models/profile");
const Post = require("../models/post");
const tokens = require("../util/token");
const bucket = require("../util/bucket");

const JsonWebTokenError = jwt.JsonWebTokenError;
const ACCESS_SECRET = process.env.ACCESS_SECRET_KEY;

module.exports.signup = async function (req, res) {
  console.log(req.originalUrl + " Signup");

  let auth = req.headers["authorization"];
  let credentials = Buffer.from(auth.split(" ")[1], "base64").toString("ascii");
  let username = credentials.substring(0, credentials.indexOf(":"));
  let password = credentials.substring(
    credentials.indexOf(":") + 1,
    credentials.length
  );

  let {
    first_name,
    last_name,
    phone_number,
    email,
    about,
    bio,
    interest,
    type,
    location,
  } = req.body;

  if (!first_name || !last_name)
    res.status(400).json({ message: "Empty fields" });

  if (!emailValidator.validate(email)) {
    return res.status(400).json({ message: "Invalid Email" });
  }

  if (!validatePhoneNumber.validate(phone_number)) {
    return res.status(400).json({ message: "Phone No. Invalid" });
  }

  let hash = await bcrypt.hash(password, 10);
  let userId = new mongoose.Types.ObjectId();
  let user = new User({
    _id: userId,
    username: username,
    password: hash,
    profile: userId,
  });

  let profile = new Profile({
    _id: userId,
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone_number: phone_number,
    type: type,
    about: about,
    bio: bio,
    interest: interest,
    location: location,
    image: "",
    cover_image: "",
  });

  let profileCreated = false;
  try {
    await profile.save(function (err) {
      if (err) {
        throw err;
        return res.send(JSON.stringify(err));
      }

      profile.on("es-indexed", function (err, res) {
        if (err) {
          throw err;
          return res.send(JSON.stringify(err));
        }
      });
    });

    profileCreated = true;
    await user.save();
  } catch (e) {
    if (e.code == "11000") {
      if (profileCreated) await profile.deleteOne({ _id: userId });

      let repeatedColumn = Object.keys(e.keyPattern)[0]
        .replace("_", " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());
      return res
        .status(400)
        .json({ message: `${repeatedColumn} already taken` });
    }
    console.log(e);
    return res.status(500).json({ message: e.message });
  }

  res.json(await tokens.getAccessAndRefreshTokens(user));
};

module.exports.login = async function (req, res) {
  console.log(req.originalUrl + " Login");

  let auth = req.headers["authorization"];

  let credentials = Buffer.from(auth.split(" ")[1], "base64").toString("ascii");
  let username = credentials.substring(0, credentials.indexOf(":"));
  let password = credentials.substring(
    credentials.indexOf(":") + 1,
    credentials.length
  );

  try {
    let user = await User.findOne({ username: username });

    if (!user) {
      res.status(404).json({ message: "Account doesn't exist" });
      return res.send();
    }

    let result = await bcrypt.compare(password, user.password);

    if (result) {
      return res.send(await tokens.getAccessAndRefreshTokens(user));
    } else
      return res.status(400).json({ message: "Wrong username or password" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports.updateProfile = async function (req, res) {
  console.log(req.originalUrl + " Updating Profile");
  let userId = req.userId;

  let profile = await Profile.findOne({ _id: userId });

  let profileFields = Object.entries(Profile.schema.paths).map((e) => e[0]);
  let nonModifiableFields = [
    "_id",
    "__v",
    "connections",
    "follows",
    "followers",
    "type",
  ];
  let newEntry = {};
  profileFields.forEach((field) => {
    if (nonModifiableFields.indexOf(field) != -1) return;
    if (req.body[field]) newEntry[field] = req.body[field];
    else if (profile[field]) newEntry[field] = profile[field];
  });

  Profile.findOneAndUpdate(
    { _id: userId },
    newEntry,
    { new: true },
    (err, doc) => {
      if (err) {
        if ((err.code = "11000")) {
          let repeatedColumn = Object.keys(err.keyPattern)[0]
            .replace("_", " ")
            .replace(/\b\w/g, (match) => match.toUpperCase());
          return res
            .status(400)
            .json({ message: `${repeatedColumn} already taken` });
        }
        console.error(err);
        return res.status(500).json({ error: err.message });
      } else {
        return res.status(200).json(doc);
      }
    }
  );
};

module.exports.profilePicture = function (req, res) {
  let userId = req.userId;

  let profile_pic = path.join("profile", `profile_pic_${userId}`);

  res.send(bucket.imageUpload(profile_pic));
};

module.exports.coverPicture = function (req, res) {
  let userId = req.userId;

  let cover_pic = path.join("cover", `cover_pic_${userId}`);

  res.send(bucket.imageUpload(cover_pic));
};

module.exports.home = async function (req, res) {
  console.log(req.originalUrl + " Homepage");
  return res.json({
    message: "This is the homepage",
  });
};

module.exports.myProfile = async function (req, res) {
  let user = await User.findById(req.userId)
    .select("-password")
    .populate({ path: "profile", model: Profile });
  const posts = await Post.find({
    $or: [{ user: user }, { tagged_users: user }],
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
      populate: {
        path: "profile",
        model: Profile,
      },
    })
    .exec();
  const post_res = { count: posts.length, posts_list: posts };
  return res.json({
    user: user,
    posts: post_res,
  });
};

module.exports.checkProfile = async function (req, res) {
  console.log(req.params.id);
  let user = await User.findById(req.params.id)
    .select("-password")
    .populate({
      path: "profile",
      model: Profile,
      populate: {
        path: "friends",
        select: "first_name last_name email about bio",
        model: Profile,
        
      },
    });
  const posts = await Post.find({
    $or: [{ user: user }, { tagged_users: user }],
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
      populate: {
        path: "profile",
        model: Profile,
      },
    })
    .exec();
  let status = 3;
  const curr_user = await Profile.findById(req.userId).exec();
  const user2 = await Profile.findById(req.params.id).exec();
  if (curr_user.friends.includes(req.params.id)) status = 0;
  else if (curr_user.sent_requests.includes(req.params.id)) status = 1;
  else if (curr_user.friend_requests.includes(req.params.id)) status = 2;
  const post_res = { count: posts.length, posts_list: posts };
  return res.json({
    user: user,
    posts: post_res,
    status: status,
  });
};
