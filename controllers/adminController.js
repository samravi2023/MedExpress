const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');

const generateDoctorUniqueId = async () => {
  let uniqueId;
  let isDuplicate = true;

  while (isDuplicate) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    uniqueId = `MEDX-DOC-${randomPart}`;
    const existingDoctor = await Doctor.findOne({ doctorUniqueId: uniqueId }).select('_id');
    isDuplicate = Boolean(existingDoctor);
  }

  return uniqueId;
};

// @desc    Get All Stats (Doctors, Patients, Revenue)
exports.getStats = async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await Patient.countDocuments();
    const paidBookings = await Booking.find({ paymentStatus: "paid" });
    
    const totalRevenue = paidBookings.reduce((acc, curr) => {
      const normalizedAmount = Number.isFinite(curr.amountValue) ? curr.amountValue : Number(curr.amount);
      return acc + (Number.isFinite(normalizedAmount) ? normalizedAmount : 0);
    }, 0);

    res.status(200).json({
      doctors: doctorCount,
      patients: patientCount,
      revenue: totalRevenue,
      bookings: paidBookings.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all doctors for management
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify a Doctor (Approve them)
exports.verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (!doctor.verificationDocuments?.idProofUrl || !doctor.verificationDocuments?.certificateUrl) {
      return res.status(400).json({ message: 'Doctor documents are incomplete. Cannot approve.' });
    }

    if (!doctor.doctorUniqueId) {
      doctor.doctorUniqueId = await generateDoctorUniqueId();
    }
    doctor.isVerified = true;
    doctor.verificationStatus = 'approved';
    doctor.rejectionReason = undefined;
    doctor.verifiedAt = new Date();
    await doctor.save();
    res.json({ message: "Doctor verified successfully", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reject a Doctor with reason
exports.rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.isVerified = false;
    doctor.verificationStatus = 'rejected';
    doctor.rejectionReason = reason.trim();
    doctor.verifiedAt = undefined;
    await doctor.save();

    res.json({ message: 'Doctor rejected successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Get all patients for management
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a patient account
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.toggleDoctorBlock = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isBlocked = !doctor.isBlocked;
    await doctor.save();

    res.json({ message: `Doctor ${doctor.isBlocked ? 'blocked' : 'unblocked'} successfully`, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Toggle Block/Unblock for a Patient
exports.togglePatientBlock = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.isBlocked = !patient.isBlocked;
    await patient.save();

    res.json({ message: `Patient ${patient.isBlocked ? 'blocked' : 'unblocked'} successfully`, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};