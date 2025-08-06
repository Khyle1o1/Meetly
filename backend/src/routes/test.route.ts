import { Router } from "express";
import { sendBookingConfirmationEmail, sendBookingReceivedEmail } from "../services/email.service";

const router = Router();

// Test endpoint for booking confirmation email
router.post("/test-booking-confirmation", async (req, res) => {
  try {
    const { email, userName, eventTitle, startTime, endTime, status, adminMessage } = req.body;
    
    await sendBookingConfirmationEmail(
      email || "amacna.khyel@gmail.com",
      userName || "Test User",
      {
        eventTitle: eventTitle || "Test Event",
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        status: status || "APPROVED",
        adminMessage: adminMessage || "This is a test message from admin"
      }
    );

    res.json({ 
      message: "Booking confirmation email sent successfully!",
      note: "Check your console for the preview URL (in development mode)"
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      message: "Failed to send test email", 
      error: error.message 
    });
  }
});

// Test endpoint for booking received email
router.post("/test-booking-received", async (req, res) => {
  try {
    const { email, userName, eventTitle, startTime, endTime } = req.body;
    
    await sendBookingReceivedEmail(
      email || "amacna.khyel@gmail.com",
      userName || "Test User",
      {
        eventTitle: eventTitle || "Test Event",
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 60 * 60 * 1000) // 1 hour later
      }
    );

    res.json({ 
      message: "Booking received email sent successfully!",
      note: "Check your console for the preview URL (in development mode)"
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      message: "Failed to send test email", 
      error: error.message 
    });
  }
});

export default router; 