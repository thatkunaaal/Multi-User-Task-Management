const express = require("express");
require("dotenv").config();
const { validateSignUpData } = require("../utlis/validate");
const { connectDB } = require("../config/database");


const app = express();
const port = 3000;

// ******************************************Middleware***************************************
app.use(express.json());

/*
Tasks:
   POST /users/register → Register a new user.   -> Almost done , just have to insert into db checking the Unqiue email.
 • POST /users/login → Login and receive JWT token.
 • POST /tasks → Create a new task (fields: title, description, status) for logged-in user.
 • GET /tasks → Get all tasks for logged-in user (with pagination: page, limit).
 • GET /tasks/:id → Get task by ID (only if belongs to logged-in user).
 • PUT /tasks/:id → Update a task (only if belongs to logged-in user).
 • DELETE /tasks/:id → Delete a task (only if belongs to logged-in user).
*/

app.post("/signup", (req, res) => {
  try {
    validateSignUpData(req);
    console.log(req.body);
    res
      .status(200)
      .json({ mesage: "Your account has been successfully created!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// Connnecting DB before listening to the server. {BEST PRACTISE}
connectDB()
  .then(() => {
    console.log("Successfully connected to DB.");
    app.listen(process.env.PORT, () => {
      console.log(`Server has been started at port: ${process.env.PORT}`);
    });
  })
  .catch(
    (err)=>{
        console.error(`Something went wrong while connecting DB. Error message: ${err.message}`);
    }
  );
