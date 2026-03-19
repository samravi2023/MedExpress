const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.getNearbyDoctors = async (req, res) => {
  const { lng, lat } = req.query;
  try {
    const doctors = await Doctor.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 10000 // 10km
        }
      }
    });
    res.json(doctors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.user.id, req.body, { new: true });
  res.json(patient);
};