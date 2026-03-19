const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http'); // Import HTTP module
const { initSocket, getIO } = require('./utils/socket');
const { getRequiredEnv } = require('./utils/env');

dotenv.config();
getRequiredEnv('JWT_SECRET');
connectDB();

const app = express();
const server = http.createServer(app); // Wrap Express with HTTP Server

initSocket(server);

// Make 'io' accessible in every route
app.use((req, res, next) => {
  req.io = getIO();
  next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/prescription', require('./routes/prescriptionRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server & Socket running on port ${PORT}`));
