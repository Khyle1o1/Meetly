import { Router } from "express";
import multer from "multer";
import {
  cancelMeetingController,
  createMeetBookingForGuestController,
  getUserMeetingsController,
  getPendingBookingsController,
  updateMeetingStatusController,
} from "../controllers/meeting.controller";
import { passportAuthenticateJwt } from "../config/passport.config";
import { HTTPSTATUS } from "../config/http.config";

const meetingRoutes = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed."));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "File size too large. Maximum size is 5MB."
      });
    }
  } else if (err) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: err.message
    });
  }
  next();
};

meetingRoutes.get(
  "/user/all",
  passportAuthenticateJwt,
  getUserMeetingsController
);

meetingRoutes.get(
  "/user/pending",
  passportAuthenticateJwt,
  getPendingBookingsController
);

meetingRoutes.post(
  "/public/create", 
  upload.single("paymentProof"), 
  handleMulterError,
  createMeetBookingForGuestController
);

meetingRoutes.put(
  "/status/:meetingId",
  passportAuthenticateJwt,
  updateMeetingStatusController
);

meetingRoutes.put(
  "/cancel/:meetingId",
  passportAuthenticateJwt,
  cancelMeetingController
);

export default meetingRoutes;
