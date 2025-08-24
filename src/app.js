const express = require("express");
require("dotenv").config();
const { validateSignUpData, validateLoginData } = require("../utlis/validate");
const { sequelize, connectDB } = require("../config/database");
const { User } = require("../model/user");
const { Task } = require("../model/task");
const bcrypt = require("bcrypt");
const { synchronizeDB } = require("../config/sync");
const { userAuth } = require("../middleware/auth");
const cookieParser = require("cookie-parser");


const app = express();
const port = 3000;
const saltRounds = 10;

// ******************************************Middleware***************************************
app.use(express.json());
app.use(cookieParser());

const authRouter = require("../route/auth");
const taskRouter = require("../route/taskRoute");



// ------------------------All Routes------------------------
app.use("/",authRouter);
app.use("/",taskRouter);


// Connnecting DB before listening to the server. {BEST PRACTISE}
connectDB()
  .then(() => {
    console.log("Successfully connected to DB.");
    return synchronizeDB();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server has been started at port: ${port}`);
    });
  })
  .catch((err) => {
    console.error(
      `Something went wrong while connecting DB & Synchronizing table. ${err.message}`
    );
  });
