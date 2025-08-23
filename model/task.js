const { Sequelize, DataTypes, Model } = require("sequelize");
const {sequelize} = require("../config/database");
const {User} = require("../model/user");

class Task extends Model {}

/*
- id (PK, auto increment)
- user_id (FK → users.id)
- title (varchar, unique per user, not null)
- description (text, nullable)
- status (enum: pending, in_progress, done, default pending)
*/

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "done"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName : 'Task',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ["user_id", "title"] }],
  }
);

module.exports = { Task };
