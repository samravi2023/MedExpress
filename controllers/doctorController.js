const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');

const toRadians = (value) => (value * Math.PI) / 180;

const distanceInMeters = (lat1, lng1, lat2, lng2) => {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const REACHED_DISTANCE_METERS = 80;


exports.toggleAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    // ⚡ REAL-TIME TRIGGER: Tell everyone a doctor changed status
    req.io.emit('doctors_updated', { type: 'status_change', doctorId: doctor._id });

    res.json({ isAvailable: doctor.isAvailable });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLocation = async (req, res) => {
  const { lng, lat } = req.body;

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return res.status(400).json({ message: 'Invalid coordinates. Expected numeric lng and lat.' });
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return res.status(400).json({ message: 'Coordinates out of range. Expected [lng, lat].' });
  }

  await Doctor.findByIdAndUpdate(req.user.id, {
    location: { type: 'Point', coordinates: [lng, lat] }
  });

  // ⚡ REAL-TIME TRIGGER: Tell everyone a doctor moved
  req.io.emit('doctors_updated', { type: 'location_change', doctorId: req.user.id });

  const activeBookings = await Booking.find({ doctorId: req.user.id, status: 'accepted' });
  for (const booking of activeBookings) {
    req.io.to(booking._id.toString()).emit('receive_location', {
      bookingId: booking._id,
      doctorId: req.user.id,
      lat,
      lng
    });

    const patientCoords = booking?.patientLocation?.coordinates;
    if (
      !booking.doctorReachedNotified
      && Array.isArray(patientCoords)
      && patientCoords.length === 2
      && Number.isFinite(patientCoords[0])
      && Number.isFinite(patientCoords[1])
    ) {
      const distance = distanceInMeters(lat, lng, patientCoords[1], patientCoords[0]);
      if (distance <= REACHED_DISTANCE_METERS) {
        booking.doctorReachedNotified = true;
        booking.doctorReachedAt = new Date();
        await booking.save();

        req.io.to(booking._id.toString()).emit('doctor_reached', {
          bookingId: booking._id,
          doctorId: req.user.id,
          reachedAt: booking.doctorReachedAt,
          distanceMeters: Math.round(distance)
        });
      }
    }
  }

  res.json({ message: "Location updated" });
};