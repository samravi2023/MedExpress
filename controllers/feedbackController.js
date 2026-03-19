const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');

exports.submitFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.id,
      userType: req.user.role,
      userName: req.user.name || req.user.username,
      subject,
      message
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitBookingFeedback = async (req, res) => {
  try {
    const { bookingId, rating, message } = req.body;

    if (!bookingId || !rating || !message) {
      return res.status(400).json({ message: 'bookingId, rating, and message are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Booking must be completed before feedback' });
    }

    const existing = await Feedback.findOne({ bookingId, userId: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'Feedback already submitted' });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      userType: req.user.role,
      userName: req.user.name || req.user.username,
      subject: 'Booking Feedback',
      message,
      bookingId,
      doctorId: booking.doctorId,
      rating
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};