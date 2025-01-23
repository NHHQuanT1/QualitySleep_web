const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const morgan = require("morgan");

const app = express();

// Settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.engine(
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: path.join(__dirname, "views/paritals"),
    helpers: {
      json: (context) => JSON.stringify(context), // Định nghĩa helper `json`
    },
  }).engine
);
app.set("view engine", ".hbs");

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(require("./routes/index"));
// app.use(require("./routes"));

// // Static files
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;
