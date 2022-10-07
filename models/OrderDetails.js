const mongoose = require("mongoose");

let orderSummary = mongoose.Schema({
  reference: [
    {
      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      noOfItems: Number,
      status: String,
    },
  ],
  walletAddress: String,
  name: String,
  contact: String,
  email: String,
  cartTotal: Number,
  userAssociateAccount: String,
  orderDate: Date,
});

let Orders = mongoose.model("Orders", orderSummary);
module.exports = Orders;
