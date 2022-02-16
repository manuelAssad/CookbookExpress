const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groceryInstancesSchema = new Schema(
  {
    grocery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grocery",
      required: true,
    },
    custom_image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomImage",
      default: null,
    },
    detail: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    crossed: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GroceryInstance = mongoose.model(
  "GroceryInstance",
  groceryInstancesSchema
);

module.exports = GroceryInstance;
