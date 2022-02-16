const express = require("express");
const groceryCategoryRouter = express.Router();

const GroceryCategory = require("../models/groceryCategory");
const authenticate = require("../authenticate");

const cors = require("./cors");

groceryCategoryRouter
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
    GroceryCategory.find()
      .then((groceryCategories) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceryCategories);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      GroceryCategory.create(req.body)
        .then((groceryCategory) => {
          console.log("Grocery Category Created", groceryCategory);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(groceryCategory);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /grocery-categories");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      GroceryCategory.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

groceryCategoryRouter
  .route("/:groceryCategoryId")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    GroceryCategory.findById(req.params.groceryCategoryId)
      .then((groceryCategory) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceryCategory);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /grocery-categories/${req.params.groceryCategoryId}`
    );
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      GroceryCategory.findByIdAndUpdate(
        req.params.groceryCategoryId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((groceryCategory) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(groceryCategory);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      GroceryCategory.findByIdAndDelete(req.params.groceryCategoryId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = groceryCategoryRouter;
