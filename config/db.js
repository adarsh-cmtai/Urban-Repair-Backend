// src/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Retrieve the MongoDB connection string from environment variables
        const mongoURI = process.env.MONGO_URI;

        // Check if the MONGO_URI is defined
        if (!mongoURI) {
            console.error("MONGO_URI is not defined in the .env file.");
            process.exit(1); // Exit the process with a failure code
        }

        // Attempt to connect to the database
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // If the connection is successful, log a confirmation message
        console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error) {
        // If there's an error during connection, log the error and exit the process
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process with a failure code
    }
};

module.exports = connectDB;