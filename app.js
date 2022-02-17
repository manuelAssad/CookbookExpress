var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const passport = require("passport");
const config = require("./config");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const groceryRouter = require("./routes/groceryRouter");
const groceryCategoryRouter = require("./routes/groceryCategoryRouter");
const groceryInstanceRouter = require("./routes/groceryInstanceRouter");
const customImageRouter = require("./routes/customImageRouter");
const recipeRouter = require("./routes/recipeRouter");
const recipeCategoryRouter = require("./routes/recipeCategoryRouter");
const recipeIngredientRouter = require("./routes/recipeIngredientRouter");
const recipePrepStepRouter = require("./routes/recipePrepStepRouter");

var app = express();

const mongoose = require("mongoose");
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  () => console.log("Connected correctly to server"),
  (err) => console.log(err)
);

var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);

app.use("/users", usersRouter);

app.use("/groceries", groceryRouter);
app.use("/grocery-instances", groceryInstanceRouter);
app.use("/grocery-categories", groceryCategoryRouter);
app.use("/custom-images", customImageRouter);
app.use("/recipes", recipeRouter);
app.use("/recipe-categories", recipeCategoryRouter);
app.use("/recipe-ingredients", recipeIngredientRouter);
app.use("/recipe-prep-steps", recipePrepStepRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
