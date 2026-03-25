const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getJwtSecret } = require('../middleware/authMiddleware');

const isValidLngLat = (coords) => {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lng, lat] = coords;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, getJwtSecret(), { expiresIn: '30d' });
};

const parseCoordsInput = (coords) => {
  if (!coords) return null;
  if (Array.isArray(coords)) return coords.map(Number);
  if (typeof coords === 'string') {
    try {
      const parsed = JSON.parse(coords);
      return Array.isArray(parsed) ? parsed.map(Number) : null;
    } catch (_err) {
      return null;
    }
  }
  return null;
};

exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    const idProofFile = req.files?.idProof?.[0];
    const certificateFile = req.files?.certificate?.[0];
    if (!idProofFile || !certificateFile) {
      return res.status(400).json({ message: 'ID proof and certificate images are required for doctor registration.' });
    }

    const parsedCoords = parseCoordsInput(req.body.coords);
    if (parsedCoords && !isValidLngLat(parsedCoords)) {
      return res.status(400).json({ message: 'Invalid coordinates. Expected [lng, lat].' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({
      name, email, password: hashedPassword, specialization,
      location: { type: 'Point', coordinates: parsedCoords || [0, 0] },
      verificationDocuments: {
        idProofUrl: `/uploads/doctors/${idProofFile.filename}`,
        certificateUrl: `/uploads/doctors/${certificateFile.filename}`
      },
      isVerified: false,
      verificationStatus: 'pending'
    });
    res.status(201).json({
      message: 'Doctor registration submitted. Please wait for admin verification and doctor ID assignment before login.',
      role: 'doctor',
      user: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        verificationStatus: doctor.verificationStatus
      }
    });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    if (role === 'doctor') user = await Doctor.findOne({ email });
    else if (role === 'patient') user = await Patient.findOne({ email });
    else user = await Admin.findOne({ username: email });
    console.log("Admin Logged in succesfully:", res.data);
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by the administrator." });
      }
      if (role === 'doctor' && (!user.isVerified || !user.doctorUniqueId)) {
        return res.status(403).json({
          message: 'Doctor account pending admin verification. Login is enabled only after approval and doctor ID generation.'
        });
      }
      res.json({ token: generateToken(user._id, role), role, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// Add this to your existing authController.js
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, coords } = req.body;
    if (coords && !isValidLngLat(coords)) {
      return res.status(400).json({ message: 'Invalid coordinates. Expected [lng, lat].' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const patient = await Patient.create({
      name, email, password: hashedPassword, phone,
      location: { type: 'Point', coordinates: coords || [0, 0] }
    });

    res.status(201).json({ 
      token: generateToken(patient._id, 'patient'), 
      role: 'patient',
      user: patient 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hash the password so the login function's bcrypt.compare works!
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await Admin.create({
      username, 
      password: hashedPassword
    });

    res.status(201).json({ 
      token: generateToken(admin._id, 'admin'), 
      role: 'admin',
      user: admin 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};