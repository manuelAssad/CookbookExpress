const express = require("express");
const User = require("../models/user");

const router = express.Router();
const passport = require("passport");
const authenticate = require("../authenticate");

const cors = require("./cors");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.options("/signup", cors.cors, (req, res) => {
  res.sendStatus(200);
});
router.post("/signup", cors.corsWithOptions, (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Successful!" });
        });
      }
    }
  );
});

router.options("/login", cors.cors, (req, res) => {
  res.sendStatus(200);
});
router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    console.log("LOGINN", req.body);
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!",
    });
  }
);

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    const err = new Error("You are not logged in!");
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
