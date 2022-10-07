const OrderSummary = require("../models/OrderDetails");
const Products = require("../models/Product");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
// const endpoint = clusterApiUrl("devnet");
const endpoint = clusterApiUrl("mainnet-beta");
const connection = new Connection(endpoint);

const sgMail = require("@sendgrid/mail");
const API_KEY =
  "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";
sgMail.setApiKey(API_KEY);

console.log(connection.getSignatureStatus, "connection.getSignatureStatus");
const TotalOrders = {
  placeOrder: async (req, res, next) => {
    try {
      const {
        data: { reference, cartTotal },
        txId,
      } = req.body;

      let receipt = null;

      while (receipt !== "finalized") {
        let result = await connection.getSignatureStatus(txId, {
          searchTransactionHistory: true,
        });
        receipt = result?.value?.confirmationStatus;
        if (receipt === "finalized") {
          let notAvailable = false;
          let notAvailableProducts = [];
          if (+reference.length > 0) {
            const data = await Promise.all(
              reference.map(async (item) => {
                let productfind = await Products.findById({
                  _id: item.referenceId,
                });
                if (productfind) {
                  await Products.updateOne(
                    {
                      _id: item.referenceId,
                    },
                    {
                      $set: {
                        totalQuantity:
                          productfind.totalQuantity - item.noOfItems,
                      },
                    }
                  );
                  return {
                    ...item,
                    available: true,
                  };
                } else {
                  notAvailable = true;
                  notAvailableProducts.push(item);
                }
              })
            );

            if (!notAvailable) {
              req.body.data.orderDate = new Date();
              let newOrder = await new OrderSummary(req.body.data);
              newOrder.save();

              const msg = {
                to: "loyalty.unigem@yahoo.com", // Change to your recipient
                // to: "techbymake@gmail.com", // Change to your recipient
                from: {
                  name: "Loyalty Token",
                  email: "mubeenahmad4043@gmail.com",
                }, // Change to your verified sender
                subject: `Order Placed by: ${req.body.data.email}`,
                text: `Order Placed by: ${req.body.data.email}`,
                html: `<h2>Order Placed by: ${req.body.data.name}</h2>
                <h2>${req.body.data.name} contact #: ${
                  req.body.data.contact
                }</h2>
                    <h2>Order Placed by: ${req.body.data.email}</h2>
                   
                    <div class="description">
                    
                    ${req.body.data.reference.map(function ({
                      name,
                      noOfItems,
                      referenceId,
                    }) {
                      return `<div><p>Product Name:${name}</p> <p> No. Items: ${noOfItems} </p></div>`;
                    })}
                    
                    </div>
                    <p>Total Amount: ${cartTotal}</p>`,
              };
              sgMail
                .send(msg)
                .then(() => {
                  console.log("Email sent");
                })
                .catch((error) => {
                  console.error(error.message);
                });

              res.json({ success: true });
            } else {
              res.json({ success: false, data: notAvailableProducts });
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  allOrders: async (req, res, next) => {
    try {
      let orders = await OrderSummary.find({})
        .populate("reference.referenceId")
        .exec()
        .then((user) => {
          const data = user;
          res.json(data);
        });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  cancelOrder: async (req, res, next) => {
    try {
      const { orderId, productId, arrayId, newQuantity, txId } = req.body;

      let receipt = null;

      while (receipt !== "finalized") {
        let result = await connection.getSignatureStatus(txId, {
          searchTransactionHistory: true,
        });
        receipt = result?.value?.confirmationStatus;
        if (receipt === "finalized") {
          await OrderSummary.updateOne(
            {
              _id: orderId,
              "reference._id": arrayId,
            },
            {
              $set: {
                "reference.$.status": "Cancelled",
              },
            }
          );

          await Products.findByIdAndUpdate(
            { _id: productId },
            { $set: { totalQuantity: newQuantity } }
          );
          res.json({ message: "Order Cancelled successfully" });
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const { orderId, productRef, status } = req.body;
      console.log(status);
      let updatedStatus = await OrderSummary.updateOne(
        { _id: orderId, "reference._id": productRef },
        { $set: { "reference.$.status": status } }
      );

      res.json({ message: "Successfully updated" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
module.exports = TotalOrders;
