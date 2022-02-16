const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeStepsSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
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

const RecipePrepStep = mongoose.model("RecipePrepStep", recipeStepsSchema);

module.exports = RecipePrepStep;
