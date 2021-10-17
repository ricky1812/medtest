const express = require('express');
const router = express.Router();

const postController= require("../controllers/postController");
const authentication = require('../util/authentication');

router.post("/posts",authentication.verifyToken, postController.posts);
router.get("/image/:id",authentication.verifyToken, postController.image_url);
router.get("/posts",authentication.verifyToken, postController.get_posts);
router.get("/my_posts", authentication.verifyToken, postController.my_posts);
router.get("/all_posts", authentication.verifyToken, postController.all_posts);
router.get("/post/:id", authentication.verifyToken, postController.retrieve_post);
router.patch("/post/:id", authentication.verifyToken, postController.update_post);
router.patch("/like_post/", authentication.verifyToken, postController.like_post);

module.exports=router;