const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch(err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Optional: Add connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

module.exports = connectDB;