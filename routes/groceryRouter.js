const express = require("express");
const groceryRouter = express.Router();

const Grocery = require("../models/grocery");
const authenticate = require("../authenticate");

const cors = require("./cors");

groceryRouter
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
    Grocery.find()
      .populate("category")
      .then((groceries) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceries);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Grocery.create(req.body)
        .then((grocery) => {
          console.log("Grocery Created", grocery);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(grocery);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    }
  )
  .put((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /groceries");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Grocery.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

groceryRouter
  .route("/:groceryId")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Grocery.findById(req.params.groceryId)
      .populate("custom_images")
      .populate("category")
      .then((grocery) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(grocery);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /groceries/${req.params.groceryId}`
    );
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Grocery.findByIdAndUpdate(
        req.params.groceryId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((grocery) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(grocery);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Grocery.findByIdAndDelete(req.params.groceryId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = groceryRouter;
