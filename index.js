var express = require("express");
var bodyParser = require("body-parser");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const app = express();

app.use("/uploads", express.static("./uploads"));
app.use(express.static("./build"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:1q2w3e4r@cluster0.um7jwgg.mongodb.net/?retryWrites=true&w=majority",
  (err, connection) => {
    if (connection) {
      console.log("mongodb is connected");
    }
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "." + file.mimetype.split("/")[1]);
  },
});
const upload = multer({ storage: storage });

const Admin = require("./routes/AdminProduct");

app.post("/add-item", upload.single("file"), Admin.addProduct);
app.get("/product-list", Admin.allProducts);
app.post("/delete-product", Admin.deleteProduct);
app.post("/find-product", Admin.findProduct);
app.post("/update-product", Admin.updateProduct);
app.post("/changedVisibility", Admin._changedVisibility);
app.post("/duplicateProduct", Admin._duplicateProduct);
app.post("/delete-multiple-product", Admin.deleteSelected);

const Categories = require("./routes/Categories");

app.post("/add-category", Categories.addCategory);
app.get("/category-list", Categories.allCategories);
app.post("/delete-category", Categories.deleteCategories);
app.post("/find-category", Categories.findCategories);
app.post("/find-category-by-name", Categories.findCategoryByName);
app.post("/update-category", Categories.updateCategories);

const Orders = require("./routes/Orders");

app.post("/place-order", Orders.placeOrder);
app.post("/orders-list", Orders.allOrders);
app.post("/cancel-order", Orders.cancelOrder);
app.post("/update-status", Orders.updateOrderStatus);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ status: false, data: error });
});

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "./build/index.html"), function (err) {
//     if (err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//   });
// });

app.get("/yes", function (req, res) {
  return res.send("yes");
});

app.listen(process.env.PORT || 8082, function () {
  console.log("Server Start at live");
});
