const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/doctors');
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${timestamp}-${safeOriginalName}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const doctorVerificationUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  doctorVerificationUpload
};
