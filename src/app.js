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
const { stat } = require("fs");

const app = express();
const port = 3000;
const saltRounds = 10;

// ******************************************Middleware***************************************
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.post("/logout", async (req, res) => {
  try {
    res.status(200).clearCookie("token").json({ message: "User logged out" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/tasks", userAuth, async (req, res) => {
  try {
    const title = req.body?.title;
    const description = req.body?.description;
    const status = req.body?.status;

    const user = req.user;

    if (!title) throw new Error("Please enter title ");

    // Checking status
    const allowedStatus = ["pending", "in_progress", "done"];
    const checkedStatus = status ? status.trim() : "pending";

    const isStatusValid = allowedStatus.includes(checkedStatus);

    if (!isStatusValid) throw new Error("Status is not valid.");

    const trimmedTitle = title.trim().toLowerCase();
    const trimmedDescription = description ? description.trim() : null;

    const titleExist = await Task.findOne({
      where: {
        user_id: user.id,
        title: trimmedTitle,
      },
    });

    if (titleExist)
      return res.status(401).json({ message: "Title already exist!" });

    const task = await Task.create({
      user_id: user.id,
      title: trimmedTitle,
      description: trimmedDescription,
      status: checkedStatus,
    });

    res.status(200).json({ message: "Task inserted successfully.", task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/tasks/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId))
      return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOne({
      where: {
        user_id: user.id,
        id: taskId,
      },
    });

    if (!task) return res.status(404).json({ mesage: "Task not found" });

    res.status(200).json({ task: task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/tasks/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId))
      return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOne({
      where: {
        user_id: user.id,
        id: taskId,
      },
    });

    if (!task) return res.status(404).json({ mesage: "Task not found" });

    const title = req.body?.title;
    const description = req.body?.description;
    const status = req.body?.status;


    if (!title) throw new Error("Please enter title ");

    // Checking status
    const allowedStatus = ["pending", "in_progress", "done"];
    const checkedStatus = status ? status.trim() : "pending";

    const isStatusValid = allowedStatus.includes(checkedStatus);

    if (!isStatusValid) throw new Error("Status is not valid.");

    const trimmedTitle = title.trim().toLowerCase();
    const trimmedDescription = description ? description.trim() : null;

    const isTitleExist = await Task.findOne({
        where:{
            user_id : user.id,
            title: trimmedTitle
        }
    })

    if(trimmedTitle)
        return res.status(401).json({message: "This title already exist"});

    task.set({
      title: trimmedTitle,
      description: trimmedDescription,
      status: checkedStatus,
    });

    await task.save();

    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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
