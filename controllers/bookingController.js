const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const ALLOWED_STATUSES = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];

const isValidLngLat = (coords) => {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lng, lat] = coords.map(Number);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

exports.createBooking = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientName,
      doctorName,
      amount,
      patientCoords,
      date = '',
      time = ''
    } = req.body;

    const resolvedPatientId = req.user?.id || patientId;
    if (!resolvedPatientId) {
      return res.status(400).json({ message: 'Unable to identify patient for booking.' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const patient = await Patient.findById(resolvedPatientId).select('name location');
    const doctor = await Doctor.findById(doctorId).select('name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    let resolvedPatientCoords = null;
    if (isValidLngLat(patientCoords)) {
      resolvedPatientCoords = patientCoords.map(Number);
    } else {
      const fallbackCoords = patient?.location?.coordinates;
      if (isValidLngLat(fallbackCoords)) {
        resolvedPatientCoords = fallbackCoords.map(Number);
      }
    }

    const booking = await Booking.create({
      patientId: resolvedPatientId,
      doctorId,
      patientName: patientName || patient?.name || 'Patient',
      doctorName: doctorName || doctor?.name || 'Doctor',
      amount: String(amount),
      amountValue: parsedAmount,
      date,
      time,
      patientLocation: resolvedPatientCoords
        ? { type: 'Point', coordinates: resolvedPatientCoords }
        : undefined,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedBy: resolvedPatientId }]
    });
    req.io?.emit('booking_updated', {
      type: 'created',
      doctorId: booking.doctorId,
      bookingId: booking._id
    });
    res.status(201).json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.getDoctorBookings = async (req, res) => {
  const bookings = await Booking.find({ doctorId: req.user.id }).sort({ createdAt: -1 });
  res.json(bookings);
};

exports.getPatientBookings = async (req, res) => {
  const bookings = await Booking.find({ patientId: req.user.id }).sort({ createdAt: -1 });
  res.json(bookings);
};

exports.updateBookingStatus = async (req, res) => {
  const { status, medicalNotes, medicalChecklist } = req.body;

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status' });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.doctorId !== req.user.id && booking.patientId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this booking' });
  }

  if (status) {
    booking.status = status;
    if (status === 'accepted') {
      booking.doctorReachedAt = null;
      booking.doctorReachedNotified = false;
    }
    if (status === 'completed') {
      // Set payment status to paid when diagnosis is completed
      booking.paymentStatus = 'paid';
    }
    booking.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date()
    });
  }

  if (typeof medicalNotes === 'string') {
    booking.medicalNotes = medicalNotes;
  }

  if (Array.isArray(medicalChecklist)) {
    booking.medicalChecklist = medicalChecklist;
  }

  await booking.save();

  req.io?.emit('booking_updated', {
    type: 'status',
    doctorId: booking?.doctorId,
    bookingId: booking?._id
  });
  if (booking?._id) {
    req.io?.to(booking._id.toString()).emit('booking_status', {
      status: booking.status,
      bookingId: booking._id,
      doctorId: booking.doctorId,
      patientId: booking.patientId
    });
  }
  res.json(booking);
};

exports.getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.patientId !== req.user.id && booking.doctorId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this booking' });
  }

  res.json(booking);
};