// models/Doctor.js
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  doctorUniqueId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, default: "General Physician" },
  fees: { type: Number, default: 500 },
  
  // Is the Doctor Online? (The Toggle Switch)
  isAvailable: { type: Boolean, default: false },
  
  // Has Admin Verified them?
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: {
    idProofUrl: { type: String },
    certificateUrl: { type: String }
  },
  rejectionReason: { type: String },
  verificationSubmittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },

  // LOCATION (The most important part for "Zepto" Logic)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [Longitude, Latitude]
  }
});

// Create a "2dsphere" Index so we can calculate distance
DoctorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Doctor', DoctorSchema);