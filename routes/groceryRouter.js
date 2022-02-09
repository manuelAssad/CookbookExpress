const express = require("express");
const groceryRouter = express.Router();

const Grocery = require("../models/groceries");
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
  .get(cors.corsWithOptions, (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");
    Grocery.find()
      .then((groceries) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceries);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res, next) => {
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
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /groceries");
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    Grocery.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

groceryRouter
  .route("/:groceryId")
  .get((req, res, next) => {
    Grocery.findById(req.params.groceryId)
      .then((grocery) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(grocery);
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /grocerys/${req.params.groceryId}`
    );
  })
  .put((req, res, next) => {
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
  })
  .delete((req, res, next) => {
    Grocery.findByIdAndDelete(req.params.groceryId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = groceryRouter;
