require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
const { handleUserQuery } = require('./NailAide');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/appointments', appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Example usage
async function runExample() {
  const response = await handleUserQuery("Tell me about your products");
  console.log("Response:", response);
  
  const customResponse = await handleUserQuery("What are your opening hours?");
  console.log("Custom Response:", customResponse);
}

runExample().catch(console.error);

// Here you would integrate with your actual frontend or messaging platform

module.exports = app;
