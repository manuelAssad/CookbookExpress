const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groceriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    default_image: {
      type: String,
      default: "default.jpg",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroceryCategory",
      required: true,
    },
    custom_images: [{ type: Schema.Types.ObjectId, ref: "CustomImage" }],
  },
  {
    timestamps: true,
  }
);

const Grocery = mongoose.model("Grocery", groceriesSchema);

module.exports = Grocery;
