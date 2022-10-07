const mongoose = require("mongoose");
const Product = require("../models/Product");
const OrderSummary = require("../models/OrderDetails");

const AdminProduct = {
  addProduct: async (req, res, next) => {
    try {
      req.body.file = req.file.path;
      const newrProduct = new Product(req.body);

      await newrProduct.save();

      res.json({ success: true });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      let response = await OrderSummary.findOne({
        "reference.referenceId": req.body.id,
      });
      if (response) {
        res.json({
          message:
            "You can't delete this Product because it is already in Order",
          success: false,
        });
      } else {
        await Product.findOneAndDelete({ _id: req.body.id });
        res.json({ message: "Product deleted", success: true });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  findProduct: async (req, res, next) => {
    try {
      let product = await Product.findOne({ _id: req.body.id });
      res.json(product);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      let response = await Product.findByIdAndUpdate(
        { _id: req.body.id },
        req.body.data
      );
      if (response) {
        res.json({ message: "Updated Product" });
      } else {
        res.json({ message: "Can't update Product" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  allProducts: async (req, res, next) => {
    try {
      let minMax = await Product.aggregate([
        {
          $group: {
            _id: null,
            maxBalance: { $max: "$price" },
            minBalance: { $min: "$price" },
          },
        },
      ]);
      const allProducts = await Product.find({}).populate("referenceId").exec();

      return res.json({
        minMax: minMax,
        allProducts: allProducts,
        contentType: "application/json",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  deleteSelected: async (req, res, next) => {
    try {
      const { ids } = req.body;

      let notDeleted = [];

      if (ids.length > 0) {
        const data = await Promise.all(
          ids.map(async (id) => {
            let productfind = await OrderSummary.findOne({
              "reference.referenceId": id,
            });

            if (productfind) {
              notDeleted.push(id);
            } else {
              await Product.findOneAndDelete({ _id: id });
            }
          })
        );
      }

      if (notDeleted.length > 0) {
        res.json({ success: false, message: notDeleted });
      } else {
        res.json({ success: true, message: "Products deleted successfully" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  _changedVisibility: async (req, res, next) => {
    try {
      const { id, checked } = req.body;

      await Product.updateOne(
        { _id: id },
        { $set: { visibility: checked } },
        { upsert: true }
      );
      res.json({ message: "Visibilty Changed" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  _duplicateProduct: async (req, res, next) => {
    try {
      await Product.findById(req.body.id).exec(function (err, doc) {
        doc._id = mongoose.Types.ObjectId();
        doc.isNew = true;
        doc.save();
      });
      return res.json({ message: "Product Copied", success: true });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};

module.exports = AdminProduct;
