// models/Booking.js - FINAL COMPLETE VERSION
const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: '' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  amount: { type: String, required: true },
  amountValue: { type: Number, default: null },
  
  // Status of the visit
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  }, // pending, accepted, rejected, completed, cancelled
  statusHistory: { type: [statusHistorySchema], default: [] },
  
  // DATE & TIME
  date: { type: String, default: "" }, 
  time: { type: String, default: "" },
  patientLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  doctorReachedAt: { type: Date, default: null },
  doctorReachedNotified: { type: Boolean, default: false },

  // --- NEW FEATURES FROM VIDEO ---
  
  // 1. Triage / Medical Report (The Checklist)
  medicalChecklist: { type: [String], default: [] }, // Stores ["High Fever", "Chest Pain"]
  medicalNotes: { type: String, default: "" },       // Doctor's written notes
  
  // 2. Payment Status (Razorpay Logic)
  paymentStatus: { type: String, default: "pending" }, // pending, processing, paid
  prescriptionId: { type: String, default: '' }
}, { timestamps: true });

BookingSchema.pre('save', function bookingPreSave() {
  if ((this.amountValue === null || this.amountValue === undefined) && this.amount !== undefined && this.amount !== null) {
    const parsed = Number(this.amount);
    this.amountValue = Number.isFinite(parsed) ? parsed : null;
  }

  if (!Array.isArray(this.statusHistory) || this.statusHistory.length === 0) {
    this.statusHistory = [{ status: this.status || 'pending', changedAt: new Date() }];
  }
});

module.exports = mongoose.model('Booking', BookingSchema);