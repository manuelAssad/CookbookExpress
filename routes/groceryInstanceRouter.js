const express = require("express");
const groceryInstanceRouter = express.Router();

const GroceryInstance = require("../models/groceryInstance");
const Grocery = require("../models/grocery");
const authenticate = require("../authenticate");

const cors = require("./cors");

groceryInstanceRouter
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
    console.log(req.user.id);
    GroceryInstance.find({ user: req.user.id })
      .populate("grocery")
      .populate("custom_image")
      .then((groceries) => {
        console.log("HELOO");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceries);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    GroceryInstance.create({ ...req.body, user: req.user.id })
      .then((groceryInstance) => {
        Grocery.findById(groceryInstance.grocery).then((grocery) => {
          const response = { ...groceryInstance._doc, grocery: grocery };

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /grocery-instances");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      GroceryInstance.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

groceryInstanceRouter
  .route("/:groceryInstanceId")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    GroceryInstance.findById(req.params.groceryInstanceId)
      .then((groceryInstance) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(groceryInstance);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /grocery-instances/${req.params.groceryInstanceId}`
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    GroceryInstance.findById(req.params.groceryInstanceId)
      .then((groceryInstance) => {
        console.log(groceryInstance.user, req.user.id);
        if (groceryInstance.user.equals(req.user.id)) {
          console.log(req.params);
          GroceryInstance.findByIdAndUpdate(
            req.params.groceryInstanceId,
            {
              $set: req.body,
            },
            { new: true }
          )
            .then((groceryInstance) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(groceryInstance);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`You are not allowed to edit this grocery instance`);
          err.status = 403;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    GroceryInstance.findById(req.params.groceryInstanceId)
      .then((groceryInstance) => {
        if (groceryInstance.user.equals(req.user.id)) {
          GroceryInstance.findByIdAndDelete(req.params.groceryInstanceId)
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(
            `You are not allowed to delete this grocery instance`
          );
          err.status = 403;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = groceryInstanceRouter;
