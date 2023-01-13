const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const { check } = require('express-validator/check');
const isAuth = require("../guards/isAuth.guard");

//target:to fetch all posts mroute:/feed/posts
router.get('/posts',isAuth,feedController.getPosts);

//target:to fetch single post mroute:/feed/post/:id
router.get('/post/:id',isAuth,feedController.getPost);

//target:create a new post mroute:/feed/creae-post
router.post('/creae-post',[
    check('title').trim().isLength({min:5}),
    check('content').trim().isLength({min:5}),
],isAuth,feedController.createPost);


//target:Edit a post mroute:/feed/edit-post/:id
router.put('/edit-post/:id',isAuth,feedController.editPost);

//target:Delete a post mroute:/feed/delete-post/:id
router.delete('/delete-post/:id',isAuth,feedController.deletePost);


module.exports = router;