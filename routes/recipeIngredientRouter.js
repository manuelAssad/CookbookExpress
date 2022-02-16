const express = require("express");
const recipeIngredientRouter = express.Router();

const RecipeIngredient = require("../models/recipeIngredient");
const authenticate = require("../authenticate");

const cors = require("./cors");
const { verify } = require("jsonwebtoken");

recipeIngredientRouter
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
      RecipeIngredient.find()
        .then((recipeIngredients) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeIngredients);
        })
        .catch((err) => next(err));
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeIngredient.create(req.body)
        .then((recipeIngredient) => {
          console.log("RecipeIngredient Created", recipeIngredient);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeIngredient);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /recipe-ingredients");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeIngredient.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

recipeIngredientRouter
  .route("/:recipeIngredientId")
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeIngredient.findById(req.params.recipeIngredientId)
        .populate("custom_images")
        .then((recipeIngredient) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeIngredient);
        })
        .catch((err) => next(err));
    }
  )
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /recipe-ingredients/${req.params.recipeIngredientId}`
    );
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeIngredient.findByIdAndUpdate(
        req.params.recipeIngredientId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((recipeIngredient) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(recipeIngredient);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      RecipeIngredient.findByIdAndDelete(req.params.recipeIngredientId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = recipeIngredientRouter;
