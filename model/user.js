const { Sequelize, DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = "TaskManager@231"


class User extends Model {

    // Instance methods

  async checkPassword(plainPassword) {
    const hashedPassword = this.password;
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async getJWT(){
    const user = this;
    const token =  await jwt.sign({"id" : user.id},JWT_SECRET_KEY,{expiresIn: "1d"});
    return token;
  }
}

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

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isStrongPass(val) {
          if (!validator.isStrongPassword(val)) {
            throw new Error(
              "Kindly enter a strong password which contain a special character , a number and whose length should be greater than 6"
            );
          }
        },
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    underscored: true,
  }
);

module.exports = { User };
