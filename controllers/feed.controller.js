const { validationResult } = require("express-validator/check");
const Post = require("../models/post.model");
const User = require("../models/user.model");

/**
 * method:getPosts
 * target : return posts in json format
 * route: /feed/posts
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns posts in json format
 */
module.exports.getPosts = (req, res, next) => {
  let page = req.query.page || 1;
  const ITEMS_IN_PAGE = 2;
  Post.find()
    .skip((page - 1) * ITEMS_IN_PAGE)
    .limit(ITEMS_IN_PAGE)
    .then((posts) => {
      return res.status(200).json({
        posts: posts,
      });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

/**
 * method:createPost
 * target : create new post.
 * route: /feed/create-post.
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns response of creation post request
 */
module.exports.createPost = (req, res, next) => {
  //   validation layer
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let error = new Error("Validation failed,entered data is incorrect.");
    error.statusCode = 422;
    error.content = errors;
    throw error;
  }
  if (!req.file) {
    let error = new Error("Validation failed,entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  let { title, content } = req.body;
  let imageUrl = req.file.path;
  let creator = req.userId;
  //Storing post in DB.
  let post = new Post({ title, content, imageUrl, creator });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post Created successfully",
        post: post,
        creator: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * method:getPost
 * target : fetch single post.
 * route: /feed/post/:id.
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns return single post with sending id.
 */
module.exports.getPost = (req, res, next) => {
  let { id } = req.params;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        let error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * method:editPost
 * target : edit existting post.
 * route: /feed/edit-post/:id.
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns response of edit post request
 */
module.exports.editPost = (req, res, next) => {
  //validation layer
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let error = new Error("Validation failed,entered data is incorrect.");
    error.statusCode = 422;
    error.content = errors;
    throw error;
  }

  let { id } = req.params;
  let { title, content } = req.body;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        let error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      post.title = title;
      post.content = content;
      if (req.file) post.imageUrl = req.file.path;
      return post.save();
    })
    .then((post) => {
      return res.status(202).json({
        message: "Post Updated successfully.",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * method:deletePost
 * target : delete post.
 * route: /feed/delete-post/:id.
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns response of delete post request
 */
module.exports.deletePost = (req, res, next) => {
  let { id } = req.params;
  let post;
  Post.findByIdAndRemove(id)
    .then((post) => {
      if (!post) {
        let error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      post = post;
      return User.findById(post.creator);
    })
    .then((user) => {
      user.posts.pull(id);
      return user.save();
    })
    .then((result) => {
      return res.status(200).json({
        message: "delete post done successfully.",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
