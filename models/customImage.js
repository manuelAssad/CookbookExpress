const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customImagesSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    grocery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grocery",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomImage = mongoose.model("CustomImage", customImagesSchema);

module.exports = CustomImage;
