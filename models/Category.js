const mongoose = require("mongoose");

let category = mongoose.Schema({
  category: String,
});

let Category = mongoose.model("Category", category);
module.exports = Category;
