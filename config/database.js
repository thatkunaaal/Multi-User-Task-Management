const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("task_app", "root", "Kishan231@", {
  host: '127.0.0.1',
  dialect: "mysql",
});


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {sequelize,connectDB};
