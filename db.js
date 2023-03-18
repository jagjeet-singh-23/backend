// This is a function to connect to the database
const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/mydatabase";
// version 18.xx of nodeJS does not support localhost
// Mongoose no longer supoorts callback functions
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;