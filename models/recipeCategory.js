const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeCategoriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const RecipeCategory = mongoose.model("RecipeCategory", recipeCategoriesSchema);

module.exports = RecipeCategory;
