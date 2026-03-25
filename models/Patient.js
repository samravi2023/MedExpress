// models/Patient.js
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  
  // PATIENT LOCATION (Where are they right now?)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [Longitude, Latitude]
  },

  // Emergency Contact (For the "108" / Panic Button feature)
  emergencyContact: { type: String, default: "108" },
  isBlocked: { type: Boolean, default: false } // Add this line
});

// Index for finding patients nearby (if needed later)
PatientSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Patient', PatientSchema);