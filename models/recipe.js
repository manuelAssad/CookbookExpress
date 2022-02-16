const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
    },
    servings: {
      type: Number,
      required: true,
    },
    cook_time: {
      type: Number,
      required: true,
    },
    prep_time: {
      type: Number,
      required: true,
    },
    recipe_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeCategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipesSchema);

module.exports = Recipe;
