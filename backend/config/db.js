const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from the backend .env file."
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      }
    );

    /*
     * Confirm that Atlas accepts a real database
     * command, not only the initial connection.
     */
    await mongoose.connection.db.admin().ping();

    console.log(
      "✅ MongoDB Connected and Pinged Successfully"
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error
    );

    process.exit(1);
  }
};

module.exports = connectDatabase;