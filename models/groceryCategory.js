const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groceryCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GroceryCategory = mongoose.model(
  "GroceryCategory",
  groceryCategorySchema
);

module.exports = GroceryCategory;
