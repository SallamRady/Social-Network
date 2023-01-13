const express = require("express");
const feetRoutes = require("./routes/feed.route");
const authRoutes = require("./routes/auth.route");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

//Helpers variables
const PORT = 3000;
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// create server application.
const app = express();

// configration our server app.
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
//Helper middleware to add general setting
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

//handle routes
app.use("/auth", authRoutes);
app.use("/feed", feetRoutes);

//error middleware
app.use((error, req, res, next) => {
  console.log("Error :", error);
  let status = error.statusCode || 500;
  let message = error.message;
  res.status(status).json({ message: message, error: error });
});

// connect with DB
mongoose
  .connect("mongodb://localhost:27017/Social-Network")
  .then(() => {
    console.log("connected!");
    app.listen(PORT);
  })
  .catch((err) => {
    console.log("mongoose error in DB connection :", err);
  });
