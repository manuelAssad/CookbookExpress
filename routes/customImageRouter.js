const express = require("express");
const customImageRouter = express.Router();

const CustomImage = require("../models/customImage");
const Grocery = require("../models/grocery");
const authenticate = require("../authenticate");

const cors = require("./cors");

customImageRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      CustomImage.find()
        .populate("grocery")
        .then((customImages) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(customImages);
        })
        .catch((err) => next(err));
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      CustomImage.create(req.body)
        .then((customImage) => {
          Grocery.findById({ _id: req.body.grocery }).then((grocery) => {
            grocery.custom_images.push(customImage.id);
            grocery.save();
          });
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(customImage);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /custom-images");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      CustomImage.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

customImageRouter
  .route("/:customImageId")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    CustomImage.findById(req.params.customImageId)
      .then((customImage) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(customImage);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /custom-images/${req.params.customImageId}`
    );
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      CustomImage.findByIdAndUpdate(
        req.params.customImageId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((customImage) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(customImage);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      CustomImage.findByIdAndDelete(req.params.customImageId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = customImageRouter;
