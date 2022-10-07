const Category = require("../models/Category");

const AllCategories = {
  addCategory: async (req, res, next) => {
    try {
      const newCategory = new Category(req.body);

      await newCategory.save();

      res.json({ success: true });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  allCategories: async (req, res, next) => {
    try {
      let categories = await Category.find({});

      res.json(categories);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  deleteCategories: async (req, res, next) => {
    try {
      await Category.findByIdAndDelete({ _id: req.body.id });
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  findCategories: async (req, res, next) => {
    try {
      let category = await Category.findOne({ _id: req.body.id });
      res.json(category);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  findCategoryByName: async (req, res, next) => {
    try {
      let category = await Category.findOne({ category: req.body.name });
      res.json(category);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  updateCategories: async (req, res, next) => {
    try {
      let response = await Category.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: { category: req.body.category } }
      );
      if (response) {
        res.json({ message: "Updated category" });
      } else {
        res.json({ message: "Can't update category" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
module.exports = AllCategories;
