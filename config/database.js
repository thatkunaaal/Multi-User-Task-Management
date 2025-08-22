const mysql = require("mysql2/promise");

const connectDB = async () => {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: process.env.HOST_NAME,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { connectDB };
