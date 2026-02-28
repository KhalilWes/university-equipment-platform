const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB using the URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connection established successfully"))
  .catch(err => console.log("❌ Connection error: ", err));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});