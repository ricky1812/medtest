const mongoose = require("mongoose");

const pagination = require("../util/pagination");
const searchDoc = require("../util/search");

const User = require("../models/user");
const Profile = require("../models/profile");

module.exports.friends = async function (req, res) {
  let profile = await Profile.findById(req.userId)
    .select("friends")
    .populate({
      path: "friends",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        select: "first_name last_name email image about bio",
      },
    });
  return res.send(profile);
};

module.exports.send_request = async function (req, res) {
  if (req.userId != req.query.id) {
    try {
      const curr_user = await Profile.findById(req.userId).exec();
      const user = await Profile.findById(req.query.id).exec();
      if (curr_user == null || user == null)
        return res.json("User not avialable");

      if (!curr_user.friends.includes(req.query.id)) {
        if (!user.friend_requests.includes(req.userId)) {
          curr_user.sent_requests.push(req.query.id);
          user.friend_requests.push(req.userId);
          curr_user.save();
          user.save();

          return res.json("Request Sent");
        } else {
          return res.status(403).json("Request Already Sent");
        }
      } else {
        return res.status(403).json("Already friends");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "error in sending request",
        error: JSON.parse(err),
      });
    }
  } else {
    res.status(403).json("you cannot send request to yourself");
  }
};

module.exports.accept_request = async function (req, res) {
  try {
    const curr_user = await Profile.findById(req.userId);
    const user = await Profile.findById(req.query.id);

    curr_user.friends.push(req.query.id);
    user.friends.push(req.userId);

    curr_user.friend_requests.pull(req.query.id);
    user.sent_requests.pull(req.userId);

    curr_user.save();
    user.save();

    return res.send("Requeest Accepted");
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

module.exports.pending_requests = async function (req, res) {
  let profile = await Profile.findById(req.userId)
    .select("friend_requests")
    .populate({
      path: "friend_requests",
      model: User,
      select: "-password",
      populate: {
        path: "profile",
        model: Profile,
        select: "first_name last_name email image about bio",
      },
    });
  return res.send(profile);
};

module.exports.search_friends = async function (req, res) {
  let first_name = req.query.first_name;
  let last_name = req.query.last_name;

  const body = {
    query: {
      bool: {
        must: [{ match_phrase_prefix: { first_name: first_name } }],
      },
    },
  };

  try {
    const resp = await searchDoc("profiles", "_doc", body);

    return res.send(JSON.stringify(resp.hits.hits));
  } catch (e) {
    console.log(e);
    return res.send(e);
  }
};
