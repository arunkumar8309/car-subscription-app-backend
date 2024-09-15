const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      // useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if unable to connect
    });
    console.log('MongoDB connected');
  } catch (err) {
    if (err.name === 'MongoNetworkError') {
      console.error('Network Error: Unable to reach MongoDB server. Please check your connection.');
    } else if (err.name === 'MongoParseError') {
      console.error('Parse Error: Check the MongoDB URI format in your .env file.');
    } else if (err.name === 'MongoTimeoutError') {
      console.error('Timeout Error: Connection to MongoDB timed out. Please try again.');
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('Server Selection Error: Could not find any MongoDB server in the cluster.');
    } else if (err.name === 'MongoAuthenticationError') {
      console.error('Authentication Error: Invalid MongoDB credentials. Please check your username and password.');
    } else {
      console.error('MongoDB connection error:', err.message);
    }

    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
