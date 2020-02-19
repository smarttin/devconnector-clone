const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const isAuth = require("../../middleware/isAuth");
const keys = require("../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// @route GET api/users/register
// @decs Register user
// @access public
router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors)
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        // const error = new Error("Email already exist.");
        // error.statusCode = 400;
        // throw error;
        errors.email = "Email already exist";
        return res.status(400).json(errors);
      }
      return bcrypt.hash(req.body.password, 12);
    })
    .then(hashedPassword => {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
      });

      const { name, email } = req.body;
      const newUser = new User({
        name,
        email,
        avatar,
        password: hashedPassword
      });
      return newUser.save();
    })
    .then(user => {
      res.json(user);
    }) 

    .catch(err => {
      console.log(err);
      // if (!err.statusCode) {
      //   err.statusCode = 500;
      // }
      // next(err);
    });
});

// @route GET api/users/register
// @decs Login user
// @access public
router.post("/login", (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors)
  }
  const { email, password } = req.body;
  let returnUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        // const error = new Error("User not found.");
        // error.statusCode = 404;
        // throw error;
        errors.email = "User not found.";
        return res.status(404).json(errors);
      }
      returnUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isMatch => {
      if (isMatch) {
        const payload = {
          id: returnUser.id,
          name: returnUser.name,
          avatar: returnUser.avatar
        }; // jwt payload
        const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: "5h" });
        res.json({ msg: "Success", token: `Bearer ${token}` });
      } else {
        errors.password = "Password is incorrect";
        return res.status(400).json(errors);
      }
    })
    .catch(err => {
      console.log(err);
      // if (!err.statusCode) {
      //   err.statusCode = 500;
      // }
      // next(err);
    });
});

router.get("/current", isAuth, (req, res, next) => {
  res.json(req.userId);

});

module.exports = router;
