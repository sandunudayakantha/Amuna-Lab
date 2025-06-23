// middleware/upload.js
import multer from "multer";
import path from "path";

// Set storage with destination + filename
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname); // Keep original file name
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"));
  }
}

// Initialize upload
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
