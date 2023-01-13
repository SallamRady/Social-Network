const { validationResult } = require("express-validator/check");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

/**
 * method:signUp
 * target : register new user.
 * route: /auth/signup
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns response for sign up request.
 */
module.exports.signUp = (req, res, next) => {
  // validation result
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let error = new Error("Validation failed,entered data is incorrect.");
    error.statusCode = 422;
    error.content = errors;
    throw error;
  }

  let { name, email, password } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        let error = new Error("this E-mail is already exist");
        error.statusCode = 422;
        throw error;
      }
    })
    .catch((err) => next(err));

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      let user = new User({ name, email, password: hashedPassword });
      return user.save();
    })
    .then((user) => {
      return res.status(201).json({
        message: "User Created Successfully.",
        userId: user._id,
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
 * method:signIn
 * target : login existting user.
 * route: /auth/signin
 * @param {req} req incomming request object
 * @param {res} res response object
 * @param {next} next move to next middleware
 * @returns response for sign in request.
 */
module.exports.signIn = (req, res, next) => {
  // validation result
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let error = new Error("Validation failed,entered data is incorrect.");
    error.statusCode = 422;
    error.content = errors;
    throw error;
  }

  let { email, password } = req.body;
  let user;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        let error = new Error("There is no user with this mail.");
        error.statusCode = 401;
        throw error;
      }
      user = userDoc;
      bcrypt.compare(password, user.password).then((isEquals) => {
        if (!isEquals) {
          let error = new Error("Password is wrong");
          error.statusCode = 401;
          throw error;
        }

        let token = jwt.sign({
            name:user.name,
            email:user.email,
            userId:userDoc._id.toString()
        },'_somesupersecret_',{expiresIn:'1h'});

        return res.status(200).json({token:token,userId:userDoc._id.toString()});
      });
    })
    .catch((err) => next(err));
};
