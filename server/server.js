require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google DNS
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/penalties', penaltyRoutes);

// Optimized Connection for Mobile Hotspots
const dbOptions = {
  serverSelectionTimeoutMS: 90000,
  socketTimeoutMS: 90000,
  connectTimeoutMS: 90000,
  family: 4 
  // removed keepAlive to fix the 'not supported' error
};

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