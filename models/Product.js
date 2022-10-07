const mongoose = require("mongoose");

let product = mongoose.Schema({
  title: String,
  description: String,
  text: String,
  file: String,
  price: Number,
  oldPrice: Number,
  sku: String,
  totalQuantity: Number,
  variant: String,
  referenceId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
},
  charecteristic: [String],
  ufm: String,
  visibility: String,
  id: String,
});

let Products = mongoose.model("Product", product);
module.exports = Products;
