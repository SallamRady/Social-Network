const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { check } = require("express-validator/check");
const User = require("../models/user.model");
//target:register new user ,route:/auth/singup
router.put(
  "/signup",
  [
    check("name", "name is required.").trim().not().isEmpty(),
    check("email", "email is invalid").isEmail().normalizeEmail(),
    check("password").trim().isLength({ min: 6 }),
  ],
  AuthController.signUp
);

//target:login in ,route:/auth/singin
router.post("/signin", check("email").isEmail(), AuthController.signIn);

module.exports = router;
