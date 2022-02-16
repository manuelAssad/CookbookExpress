const express = require("express");
const recipeRouter = express.Router();

const Recipe = require("../models/recipe");
const RecipePrepStep = require("../models/recipePrepStep");
const RecipeIngredient = require("../models/recipeIngredient");
const authenticate = require("../authenticate");

const cors = require("./cors");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

recipeRouter
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
    let query = null;
    if (req.query.recipe_category) {
      query = { recipe_category: req.query.recipe_category };
    }
    Recipe.find(query)
      .populate("owner")
      .populate("recipe_category")
      .then((recipes) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(recipes);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // upload.single("imageFile");

    const promises = [];

    console.log(req.body);
    Recipe.create({
      title: req.body.name,
      owner: req.user._id,
      servings: req.body.servings,
      cook_time: req.body.cookTime,
      prep_time: req.body.prepTime,
      recipe_category: req.body.category._id,
    })
      .then((recipe) => {
        var base64Data = req.body.imageFile.replace(
          /^data:image\/png;base64,/,
          ""
        );

        require("fs").writeFile(
          `public/images/${recipe._id}.jpg`,
          base64Data,
          "base64",
          function (err) {
            console.log(err);
          }
        );

        recipe.image = `images/${recipe._id}.jpg`;
        recipe.save();

        req.body.ingredients.forEach((ingredient) => {
          promises.push(
            RecipeIngredient.create({
              recipe: recipe._id,
              grocery: ingredient.grocery._id,
              detail: ingredient.detail,
              position: ingredient.position,
            })
          );
        });
        req.body.prepSteps.forEach((prep_step) => {
          promises.push(
            RecipePrepStep.create({
              title: prep_step.title,
              description: prep_step.description,
              position: prep_step.position,
              recipe: recipe._id,
            })
              .then((prep_step) => {})
              .catch((err) => {
                console.log(err);
                next(err);
              })
          );
        });

        Promise.all(promises).then(() => {
          Recipe.findById(recipe._id)
            .populate("owner")
            .populate("recipe_category")
            .then((recipe) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(recipe);
            });
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /recipes");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Recipe.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

recipeRouter
  .route("/:recipeId")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user, "OWNERRRR");
    Recipe.findById(req.params.recipeId)
      .populate("owner")
      .populate("recipe_category")
      .then((recipe) => {
        RecipePrepStep.find({ recipe: recipe.id }).then((recipePrepSteps) => {
          RecipeIngredient.find({ recipe: recipe.id })
            .populate("grocery")

            .then((recipeIngredients) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              const response = {};
              response.recipe = recipe;
              response.prep_steps = recipePrepSteps.sort((a, b) =>
                a.position > b.position ? 1 : -1
              );
              response.ingredients = recipeIngredients.sort((a, b) =>
                a.position > b.position ? 1 : -1
              );
              console.log(response);
              res.json(response);
            })
            .catch((err) => next(err));
        });
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /recipes/${req.params.recipeId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Recipe.findById(req.params.recipeId)
      .then((recipe) => {
        if (req.user.admin) {
          Recipe.findByIdAndUpdate(
            req.params.recipeId,
            {
              $set: {
                title: req.body.name,
                servings: req.body.servings,
                cook_time: req.body.cookTime,
                prep_time: req.body.prepTime,
                recipe_category: req.body.category._id,
              },
            },
            { new: true }
          )
            .then((recipe) => {
              if (req.body.imageFile.includes("base64")) {
                var base64Data = req.body.imageFile.replace(
                  /^data:image\/png;base64,/,
                  ""
                );

                require("fs").writeFile(
                  `public/images/${recipe._id}.jpg`,
                  base64Data,
                  "base64",
                  function (err) {
                    console.log(err);
                  }
                );

                recipe.image = `images/${recipe._id}.jpg`;
                recipe.save();
              }

              const ingredientsList = req.body.ingredients;
              const recipeStepsList = req.body.prep_steps;

              const newIngredientsList = [];
              const newPrepStepsList = [];

              const promises = [];

              if (ingredientsList) {
                promises.push(
                  RecipeIngredient.deleteMany({ recipe: recipe._id }).then(
                    (response) => {
                      ingredientsList.forEach((ingredient) => {
                        promises.push(
                          RecipeIngredient.create({
                            ...ingredient,
                            recipe: recipe._id,
                          }).then((ingredient) => {
                            newIngredientsList.push(ingredient);
                          })
                        );
                      });
                    }
                  )
                );
              }

              if (recipeStepsList)
                recipeStepsList.forEach((recipe) => {
                  if (recipe._id) {
                    promises.push(
                      RecipePrepStep.findByIdAndUpdate(
                        recipe.id,
                        {
                          $set: recipe,
                        },
                        { new: true }
                      )
                        .then((recipe) => {
                          newPrepStepsList.push(recipe);
                        })
                        .catch((err) => next(err))
                    );
                  } else {
                    promises.push(
                      RecipePrepStep.create(recipe).then((recipe) => {
                        newPrepStepsList.push(recipe);
                      })
                    );
                  }
                });

              const response = {};
              Promise.all(promises).then(() => {
                Recipe.findById(recipe._id)
                  .populate("owner")
                  .populate("recipe_category")
                  .then((recipe) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    response.recipe = recipe;
                    response.ingredients = newIngredientsList;
                    response.prep_steps = newPrepStepsList;
                    res.json(response);
                  });
              });
            })
            .catch((err) => next(err));
        } else if (!recipe.owner) {
          err = new Error(`You are not allowed to edit this recipe`);
          err.status = 403;
          return next(err);
        } else if (recipe.owner.equals(req.user.id)) {
          Recipe.findByIdAndUpdate(
            req.params.recipeId,
            {
              $set: {
                title: req.body.name,
                servings: req.body.servings,
                cook_time: req.body.cookTime,
                prep_time: req.body.prepTime,
                recipe_category: req.body.category._id,
              },
            },
            { new: true }
          )
            .then((recipe) => {
              if (req.body.imageFile.includes("base64")) {
                var base64Data = req.body.imageFile.replace(
                  /^data:image\/png;base64,/,
                  ""
                );

                require("fs").writeFile(
                  `public/images/${recipe._id}.jpg`,
                  base64Data,
                  "base64",
                  function (err) {
                    console.log(err);
                  }
                );

                recipe.image = `images/${recipe._id}.jpg`;
                recipe.save();
              }

              const ingredientsList = req.body.ingredients;
              const recipeStepsList = req.body.prep_steps;

              const newIngredientsList = [];
              const newPrepStepsList = [];

              const promises = [];

              if (ingredientsList) {
                promises.push(
                  RecipeIngredient.deleteMany({ recipe: recipe._id }).then(
                    (response) => {
                      ingredientsList.forEach((ingredient) => {
                        promises.push(
                          RecipeIngredient.create({
                            ...ingredient,
                            recipe: recipe._id,
                          }).then((ingredient) => {
                            newIngredientsList.push(ingredient);
                          })
                        );
                      });
                    }
                  )
                );
              }

              if (recipeStepsList)
                recipeStepsList.forEach((recipe) => {
                  if (recipe._id) {
                    promises.push(
                      RecipePrepStep.findByIdAndUpdate(
                        recipe.id,
                        {
                          $set: recipe,
                        },
                        { new: true }
                      )
                        .then((recipe) => {
                          newPrepStepsList.push(recipe);
                        })
                        .catch((err) => next(err))
                    );
                  } else {
                    promises.push(
                      RecipePrepStep.create(recipe).then((recipe) => {
                        newPrepStepsList.push(recipe);
                      })
                    );
                  }
                });

              const response = {};
              Promise.all(promises).then(() => {
                Recipe.findById(recipe._id)
                  .populate("owner")
                  .populate("recipe_category")
                  .then((recipe) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    response.recipe = recipe;
                    response.ingredients = newIngredientsList;
                    response.prep_steps = newPrepStepsList;
                    res.json(response);
                  });
              });
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`You are not allowed to edit this recipe`);
          err.status = 403;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Recipe.findById(req.params.recipeId)
      .then((recipe) => {
        console.log(req.user);
        if (req.user.admin) {
          Recipe.findByIdAndDelete(req.params.recipeId)
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else if (!recipe.owner) {
          err = new Error(`You are not allowed to delete this recipe`);
          err.status = 403;
          return next(err);
        } else if (recipe.owner.equals(req.user.id)) {
          Recipe.findByIdAndDelete(req.params.recipeId)
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`You are not allowed to delete this recipe`);
          err.status = 403;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = recipeRouter;
