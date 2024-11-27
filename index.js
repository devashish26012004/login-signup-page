const express = require("express");
const mongoose = require("mongoose");
const usersModel = require("./model/dbModel.js");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8080;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const dbURL = "mongodb://localhost:27017/login-signup";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
  };

  const existingUser = await usersModel.findOne({ username: data.username });
  if (existingUser) {
    res.send("User already exists");
  } else {
    const saltingRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltingRounds);

    data.password = hashedPassword;

    const userData = await usersModel.insertMany(data);
    console.log(userData);
    res.render("login");
  }
});

app.post("/login", async (req, res) => {
  try {
    const isExistingUser = await usersModel.findOne({
      username: req.body.username,
    });
    if (!isExistingUser) {
      res.send("Username doesnot exists");
    } else {
      const isPasswordmatched = await bcrypt.compare(
        req.body.password,
        isExistingUser.password
      );

      if (!isPasswordmatched) {
        res.send("Wrong Password");
      } else {
        res.render("home");
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, (req, res) => {
  console.log(`listing on port ${PORT}`);
});
