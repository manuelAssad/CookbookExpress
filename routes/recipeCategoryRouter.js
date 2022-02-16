const express = require("express");
const recipeCategoryRouter = express.Router();

const RecipeCategory = require("../models/recipeCategory");
const authenticate = require("../authenticate");

const cors = require("./cors");

recipeCategoryRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    RecipeCategory.find()
      .then((recipeCategories) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(recipeCategories);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeCategory.create(req.body)
        .then((recipeCategory) => {
          console.log("RecipeCategory Created", recipeCategory);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeCategory);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /recipe-categories");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeCategory.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

recipeCategoryRouter
  .route("/:recipeCategoryId")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    RecipeCategory.findById(req.params.recipeCategoryId)
      .populate("custom_images")
      .then((recipeCategory) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(recipeCategory);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /recipeCategories/${req.params.recipeCategoryId}`
    );
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeCategory.findByIdAndUpdate(
        req.params.recipeCategoryId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((recipeCategory) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeCategory);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeCategory.findByIdAndDelete(req.params.recipeCategoryId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = recipeCategoryRouter;
