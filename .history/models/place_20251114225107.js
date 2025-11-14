// server/models/place.js
const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, index: true }, // e.g. 'swim', 'eat', 'stay'
  address: String,
  location: String, // simple textual location or store geo JSON if you want
  image: String,    // URL
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Place', PlaceSchema);
