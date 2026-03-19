const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  userType: { type: String, required: true }, // "doctor" or "patient"
  userName: { type: String, required: true }, 
  subject: { type: String, default: "General Support" }, 
  message: { type: String, required: true }, 
  status: { type: String, default: "pending" },
  bookingId: { type: String, default: null },
  doctorId: { type: String, default: null },
  rating: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);