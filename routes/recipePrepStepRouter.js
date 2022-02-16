const express = require("express");
const recipePrepStepRouter = express.Router();

const RecipePrepStep = require("../models/recipePrepStep");
const authenticate = require("../authenticate");

const cors = require("./cors");

recipePrepStepRouter
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
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      RecipePrepStep.find()
        .then((recipePrepSteps) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipePrepSteps);
        })
        .catch((err) => next(err));
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipePrepStep.create(req.body)
        .then((recipePrepStep) => {
          console.log("RecipePrepStep Created", recipePrepStep);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipePrepStep);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /recipe-prep-steps");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipePrepStep.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

recipePrepStepRouter
  .route("/:recipePrepStepId")
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipePrepStep.findById(req.params.recipePrepStepId)
        .populate("custom_images")
        .then((recipePrepStep) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipePrepStep);
        })
        .catch((err) => next(err));
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `POST operation not supported on /recipe-prep-steps/${req.params.recipePrepStepId}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipePrepStep.findByIdAndUpdate(
        req.params.recipePrepStepId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((recipePrepStep) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipePrepStep);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipePrepStep.findByIdAndDelete(req.params.recipePrepStepId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = recipePrepStepRouter;
