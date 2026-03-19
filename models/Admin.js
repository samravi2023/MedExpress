const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple text password for demo
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);