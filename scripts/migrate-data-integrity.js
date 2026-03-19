require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Booking = require('../models/Booking');
const Prescription = require('../models/Prescription');

const normalizeAmount = (booking) => {
  if (Number.isFinite(booking.amountValue)) {
    return false;
  }

  const parsed = Number(booking.amount);
  if (Number.isFinite(parsed) && parsed >= 0) {
    booking.amountValue = parsed;
    return true;
  }

  return false;
};

const ensureStatusHistory = (booking) => {
  if (Array.isArray(booking.statusHistory) && booking.statusHistory.length > 0) {
    return false;
  }

  booking.statusHistory = [
    {
      status: booking.status || 'pending',
      changedAt: booking.updatedAt || booking.createdAt || new Date(),
      changedBy: booking.doctorId || booking.patientId || ''
    }
  ];

  return true;
};

const migrateBookings = async () => {
  const bookings = await Booking.find({});
  let touchedCount = 0;

  for (const booking of bookings) {
    let shouldSave = false;

    shouldSave = normalizeAmount(booking) || shouldSave;
    shouldSave = ensureStatusHistory(booking) || shouldSave;

    const linkedPrescription = await Prescription.findOne({ bookingId: booking._id.toString() }).select('_id');
    if (linkedPrescription && booking.prescriptionId !== linkedPrescription._id.toString()) {
      booking.prescriptionId = linkedPrescription._id.toString();
      shouldSave = true;
    }

    if (shouldSave) {
      await booking.save();
      touchedCount += 1;
    }
  }

  return {
    total: bookings.length,
    updated: touchedCount
  };
};

const migratePrescriptions = async () => {
  const prescriptions = await Prescription.find({});
  let touchedCount = 0;

  for (const prescription of prescriptions) {
    let shouldSave = false;

    if (!prescription.bookingObjectId && mongoose.Types.ObjectId.isValid(prescription.bookingId)) {
      prescription.bookingObjectId = new mongoose.Types.ObjectId(prescription.bookingId);
      shouldSave = true;
    }

    if (shouldSave) {
      await prescription.save();
      touchedCount += 1;
    }

    const booking = await Booking.findById(prescription.bookingId).select('_id prescriptionId');
    if (booking && booking.prescriptionId !== prescription._id.toString()) {
      booking.prescriptionId = prescription._id.toString();
      await booking.save();
    }
  }

  return {
    total: prescriptions.length,
    updated: touchedCount
  };
};

const run = async () => {
  try {
    await connectDB();

    const bookingStats = await migrateBookings();
    const prescriptionStats = await migratePrescriptions();

    console.log('Migration complete');
    console.log('Bookings:', bookingStats);
    console.log('Prescriptions:', prescriptionStats);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
