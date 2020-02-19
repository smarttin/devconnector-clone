const express = require("express");
const router = express.Router();

const isAuth = require("../../middleware/isAuth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get("/", isAuth, (req, res) => {
  const errors = {};
  // console.log(req.userId);
  Profile.findOne({ user: req.userId })
    .populate("user", ["name, avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      // console.log(profile);
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// @route   GET api/profile
// @desc    POST current user profile
// @access  Private
router.post("/", isAuth, (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.userId;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;
  // Skills - Spilt into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.userId }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate(
        { user: req.userId },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      // Create

      // Check if handle exists
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      // console.log(profiles);
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => {
      // console.log(err);
      res.status(404).json({ profile: "There are no profile" });
    });
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post("/experience", isAuth, (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.userId })
  .then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    // Add to exp array
    profile.experience.unshift(newExp);
    return profile.save()
  })
  .then(profile => {
    res.json(profile)
  })
  .catch(err => console.log(err))
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post("/education", isAuth, (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.userId })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      // Add to exp array
      profile.education.unshift(newEdu);
      return profile.save()
    })
    .then(profile => res.json(profile))
    .catch(err => console.log(err));
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete("/experience/:exp_id", isAuth, (req, res) => {
  Profile.findOne({ user: req.userId })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1);
      // Save
      return profile.save()
    })
    .then(profile => res.json(profile))
    .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete("/education/:edu_id", isAuth, (req, res) => {
  Profile.findOne({ user: req.userId })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      // Splice out of array
      profile.education.splice(removeIndex, 1);
      // Save
      return profile.save()
    })
    .then(profile => res.json(profile))
    .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete("/", isAuth, (req, res) => {
  Profile.findOneAndRemove({ user: req.userId })
    .then(() => {
      return User.findOneAndRemove({ _id: req.userId })
    })
    .then(() => res.json({ success: true }))
    .catch(err => console.log(err))
});

module.exports = router;
