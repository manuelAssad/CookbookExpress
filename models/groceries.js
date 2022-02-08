const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groceriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Grocery = mongoose.model("Grocery", groceriesSchema);

module.exports = Grocery;
