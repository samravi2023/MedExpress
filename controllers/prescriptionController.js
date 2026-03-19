const Prescription = require('../models/Prescription');
const Booking = require('../models/Booking');

exports.createPrescription = async (req, res) => {
  try {
    const {
      bookingId,
      clinicName,
      diagnosisTitle,
      symptoms,
      visitDate,
      medicines,
      signature
    } = req.body;

    if (!bookingId || !clinicName || !diagnosisTitle || !symptoms || !visitDate || !medicines || !signature) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create this prescription' });
    }

    const existing = await Prescription.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ message: 'Prescription already exists' });
    }

    const prescription = await Prescription.create({
      bookingId: booking._id.toString(),
      bookingObjectId: booking._id,
      patientId: booking.patientId,
      doctorId: booking.doctorId,
      patientName: booking.patientName,
      doctorName: booking.doctorName,
      clinicName,
      diagnosisTitle,
      symptoms,
      visitDate,
      medicines,
      signature
    });

    booking.prescriptionId = prescription._id.toString();
    await booking.save();

    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPrescriptionByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const prescription = await Prescription.findOne({ bookingId });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.patientId !== req.user.id && prescription.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
