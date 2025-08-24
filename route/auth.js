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
const authRouter = express.Router();

const saltRounds = parseInt(process.env.SALT_ROUNDS);

authRouter.post("/users/register", async (req, res) => {
  try {
    // Step-1) Validate & santitising the request body.
    validateSignUpData(req);

    const { name, email, password } = req.body;

    // Step-2) Checking whether the user is already registered or not.
    const alreadyExist = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (alreadyExist) {
      throw new Error("User is already registered.");
    }

    // Step-3) Encrypting the password.
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    res
      .status(200)
      .json({ mesage: "Your account has been successfully created!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    // Input validation.
    validateLoginData(req);

    const { email, password } = req.body;

    //Finding that email in the DB.
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) throw new Error("Invalid credentials!");

    // Check password in the DB.
    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) throw new Error("Invalid credentials!");

    console.log(user);

    // Attaching JWT
    const token = await user.getJWT();

    res
      .status(200)
      .cookie("token", token, { expires: new Date(Date.now() + 3600000 * 24) }) //cookies expires in 24hrs.
      .json({ message: "Login Successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.status(200).clearCookie("token").json({ message: "User logged out" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = authRouter;