
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google DNS
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware to parse JSON and allow frontend requests
app.use(cors());
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

const equipmentData = [
  { id: 1, name: "Projector", status: "Available", quantity: 4, description: "Projector for classroom presentations." },
  { id: 2, name: "Laptop", status: "Out of Stock", quantity: 0, description: "Portable laptop for student work." },
  { id: 3, name: "Camera", status: "Available", quantity: 3, description: "Camera for media projects." },
  { id: 4, name: "Microphone", status: "Out of Stock", quantity: 0, description: "Microphone for recordings." },
];

const getNextEquipmentId = () => {
  if (equipmentData.length === 0) return 1;
  return Math.max(...equipmentData.map((item) => item.id)) + 1;
};

// Test Route
app.get('/', (req, res) => {
  res.send('University Equipment Platform API is running...');
});

app.get('/api/equipment', (req, res) => {
  res.json(equipmentData);
});

app.post('/api/equipment', (req, res) => {
  const { name, status, quantity, description } = req.body;
  if (!name || !status || quantity === undefined || quantity === null) {
    return res.status(400).json({ message: 'name, status, and quantity are required.' });
  }

  if (!['Available', 'Out of Stock'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Available or Out of Stock.' });
  }

  const numericQuantity = Number(quantity);
  if (Number.isNaN(numericQuantity) || numericQuantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative number.' });
  }

  const newItem = {
    id: getNextEquipmentId(),
    name: name.trim(),
    status,
    quantity: numericQuantity,
    description: description ? description.trim() : "",
  };

  equipmentData.push(newItem);
  return res.status(201).json(newItem);
});

app.put('/api/equipment/:id', (req, res) => {
  const equipmentId = Number(req.params.id);
  const item = equipmentData.find((entry) => entry.id === equipmentId);
  if (!item) {
    return res.status(404).json({ message: 'Equipment not found.' });
  }

  const { name, status, quantity, description } = req.body;
  if (!name || !status || quantity === undefined || quantity === null) {
    return res.status(400).json({ message: 'name, status, and quantity are required.' });
  }

  if (!['Available', 'Out of Stock'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Available or Out of Stock.' });
  }

  const numericQuantity = Number(quantity);
  if (Number.isNaN(numericQuantity) || numericQuantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative number.' });
  }

  item.name = name.trim();
  item.status = status;
  item.quantity = numericQuantity;
  item.description = description ? description.trim() : "";

  return res.json(item);
});

app.delete('/api/equipment/:id', (req, res) => {
  const equipmentId = Number(req.params.id);
  const index = equipmentData.findIndex((entry) => entry.id === equipmentId);
  if (index === -1) {
    return res.status(404).json({ message: 'Equipment not found.' });
  }

  equipmentData.splice(index, 1);
  return res.json({ success: true, message: 'Equipment deleted successfully.' });
});

app.post('/api/reservations', (req, res) => {
  const { equipmentId, startDate, endDate } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!equipmentId || !startDate || !endDate) {
    return res.status(400).json({ message: 'equipmentId, startDate and endDate are required.' });
  }

  if (startDate < today) {
    return res.status(400).json({ message: 'La date de début doit être aujourd\'hui ou ultérieure.' });
  }

  if (endDate < startDate) {
    return res.status(400).json({ message: 'La date de fin doit être égale ou postérieure à la date de début.' });
  }

  const equipmentItem = equipmentData.find((item) => item.id === Number(equipmentId));
  if (!equipmentItem) {
    return res.status(404).json({ message: 'Équipement introuvable.' });
  }

  if (equipmentItem.quantity <= 0 || equipmentItem.status !== 'Available') {
    return res.status(400).json({ message: 'Cet équipement n\'est pas disponible.' });
  }

  equipmentItem.quantity -= 1;
  if (equipmentItem.quantity <= 0) {
    equipmentItem.quantity = 0;
    equipmentItem.status = 'Out of Stock';
  }

  console.log('Reservation request:', { equipmentId, startDate, endDate });
  return res.json({
    success: true,
    message: 'Réservation enregistrée.',
    equipment: equipmentItem,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});