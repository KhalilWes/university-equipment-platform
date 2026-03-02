
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google DNS
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Optimized Connection for Mobile Hotspots
const dbOptions = {
  serverSelectionTimeoutMS: 90000,
  socketTimeoutMS: 90000,
  connectTimeoutMS: 90000,
  family: 4 
  // removed keepAlive to fix the 'not supported' error
};
console.log("DEBUG: Your URI is:", process.env.MONGO_URI ? "FOUND ✅" : "NOT FOUND ❌");

// Add a connection event listener to see what's happening in real-time
mongoose.connection.on('connecting', () => console.log('⏳ Attempting to open the door to Atlas...'));
mongoose.connection.on('error', (err) => console.log('❌ Mongoose internal error:', err));

mongoose.connect(process.env.MONGO_URI, dbOptions)
  .then(() => {
    console.log("------------------------------------------");
    console.log("✅ FINALLY! Connected to MongoDB Atlas");
    console.log("------------------------------------------");
  })
  .catch(err => {
    console.log("------------------------------------------");
    console.log("❌ Connection error: ", err.message);
    console.log("------------------------------------------");
  });

// Test Route
app.get('/', (req, res) => {
  res.send('University Equipment Platform API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});