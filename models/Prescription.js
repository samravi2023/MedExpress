const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  bookingObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  clinicName: { type: String, required: true },
  diagnosisTitle: { type: String, required: true },
  symptoms: { type: String, required: true },
  visitDate: { type: String, required: true },
  medicines: { type: String, required: true },
  signature: { type: String, required: true }
}, { timestamps: true });

PrescriptionSchema.index({ bookingObjectId: 1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
