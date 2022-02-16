const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeIngredientsSchema = new Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    grocery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grocery",
      required: true,
    },
    detail: {
      type: String,
      default: "",
    },
    position: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecipeIngredient = mongoose.model(
  "RecipeIngredient",
  recipeIngredientsSchema
);

module.exports = RecipeIngredient;
