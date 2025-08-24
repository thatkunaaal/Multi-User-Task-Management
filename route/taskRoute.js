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
const taskRouter = express.Router();

taskRouter.post("/tasks", userAuth, async (req, res) => {
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

taskRouter.get("/tasks/:id", userAuth, async (req, res) => {
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

taskRouter.put("/tasks/:id", userAuth, async (req, res) => {
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

    const { title, description, status } = req.body;

    if (!title || !status) {
      return res.status(400).json({ message: "Title and status are required" });
    }

    // Checking status
    const allowedStatus = ["pending", "in_progress", "done"];
    const checkedStatus = status.trim().toLowerCase();

    if(!allowedStatus.includes(checkedStatus))
        return res.status(404).json({message : "Status is not valid."});

    const trimmedTitle = title.trim().toLowerCase();
    const trimmedDescription = description ? description.trim() : null;

    // Checking existing task.
    const existingTask = await Task.findOne({
      where: { user_id: user.id, title: trimmedTitle },
    });

    if (existingTask && existingTask.id !== task.id) {
      return res.status(409).json({ message: "Title already exists for this user" });
    }

    task.set({
      title: trimmedTitle,
      description: trimmedDescription,
      status: checkedStatus,
    });

    await task.save();

    res.status(200).json({ message: "Task updated successfully" ,task});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

taskRouter.delete("/tasks/:id",userAuth,async (req,res) => {
    try {
        const user = req.user;
        const taskId = parseInt(req.params.id);

        // Validating task id.
        if(isNaN(taskId))
            return res.status(404).json({message: "Task not found."});

        const task = await Task.findOne({
            where: {
                user_id : user.id,
                id : taskId,
            }
        })

        if(!task)
            return res.status(404).json({message: "Task not found."});
        
        await task.destroy();

        res.status(200).json({message: "Task has been successfully deleted.",
            task
        })
        
    } catch (err) {
        res.status(400).json({message : err.mesage});
    }
})

taskRouter.get("/tasks/",userAuth,async (req,res) => {
    try {
        
        const user = req.user;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        if(page<=0 || limit<=0){
            page = 1;
            limit = 10;
        }

        limit = (limit > 50) ? 50 : limit;
        const skip = (page-1)*limit;

        const {count , rows: tasks} = await Task.findAndCountAll({
            where: {
                user_id : user.id,
            },
            offset: skip,
            limit,
        })

        if(tasks.length == 0)
            return res.status(400).json({message : "Task not found."});

        res.status(200).json({
            taskCount : count,
            tasks,
            currentPage: page
        })
        

    } catch (err) {
        res.status(400).json({message : err.mesage});
    }
})

module.exports = taskRouter;