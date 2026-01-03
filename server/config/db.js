const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    // MongoDB connection string
    const mongoURI = process.env.MONGO_URI || `mongodb://localhost:27017/hrms_db`;

    const conn = await mongoose.connect(mongoURI, {
      // These options are recommended for Mongoose 6+
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
