import nodemailer from "nodemailer";
import { config } from "../config/app.config";

// Create transporter
const createTransporter = async () => {
  if (config.NODE_ENV === "development") {
    // For development, use Gmail SMTP with test credentials
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your-app-password",
      },
    });
  }

  // For production, use Gmail SMTP
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password",
    },
  });
};

export const sendBookingConfirmationEmail = async (
  to: string,
  userName: string,
  bookingDetails: {
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    status: string;
    adminMessage?: string;
    selectedPackage?: {
      name: string;
      description?: string;
      price: number;
      duration?: string;
      inclusions?: string;
    };
  }
) => {
  try {
    const transporter = await createTransporter();

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const getStatusMessage = (status: string) => {
      switch (status) {
        case "PENDING":
          return "Your booking has been submitted and is pending approval.";
        case "APPROVED":
          return "Your booking has been approved!";
        case "DECLINED":
          return "Your booking was not approved. Please review your submission.";
        default:
          return "Your booking status has been updated.";
      }
    };

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(price);
    };

    const subject = `Booking ${bookingDetails.status.toLowerCase()} - ${bookingDetails.eventTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Status Update</h2>
        <p>Dear ${userName},</p>
        <p>${getStatusMessage(bookingDetails.status)}</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Event:</strong> ${bookingDetails.eventTitle}</p>
          <p><strong>Date & Time:</strong> ${formatDate(bookingDetails.startTime)} - ${formatDate(bookingDetails.endTime)}</p>
          <p><strong>Status:</strong> ${bookingDetails.status}</p>
        </div>
        
        ${bookingDetails.selectedPackage ? `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #2e7d32;">📦 Selected Package</h3>
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>Package Name:</strong> ${bookingDetails.selectedPackage.name}</p>
              <p style="margin: 5px 0;"><strong>Price:</strong> ${formatPrice(bookingDetails.selectedPackage.price)}</p>
              ${bookingDetails.selectedPackage.duration ? `<p style="margin: 5px 0;"><strong>Duration:</strong> ${bookingDetails.selectedPackage.duration}</p>` : ''}
            </div>
            ${bookingDetails.selectedPackage.description ? `
              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Description:</strong></p>
                <p style="margin: 5px 0; color: #555; font-style: italic;">${bookingDetails.selectedPackage.description}</p>
              </div>
            ` : ''}
            ${bookingDetails.selectedPackage.inclusions ? `
              <div>
                <p style="margin: 5px 0;"><strong>Inclusions:</strong></p>
                <p style="margin: 5px 0; color: #555; font-style: italic;">${bookingDetails.selectedPackage.inclusions}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${bookingDetails.adminMessage ? `
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Message from Admin:</h4>
            <p>${bookingDetails.adminMessage}</p>
          </div>
        ` : ''}
        
        <p>Thank you for using our booking system!</p>
        <p>Best regards,<br>The Meetly Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email notification");
  }
};

export const sendBookingReceivedEmail = async (
  to: string,
  userName: string,
  bookingDetails: {
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    selectedPackage?: {
      name: string;
      description?: string;
      price: number;
      duration?: string;
      inclusions?: string;
    };
  }
) => {
  try {
    const transporter = await createTransporter();

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(price);
    };

    const subject = "Booking Received - Pending Approval";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Received</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for submitting your booking request. We have received your application and it is currently pending approval.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Event:</strong> ${bookingDetails.eventTitle}</p>
          <p><strong>Date & Time:</strong> ${formatDate(bookingDetails.startTime)} - ${formatDate(bookingDetails.endTime)}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        
        ${bookingDetails.selectedPackage ? `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #2e7d32;">📦 Selected Package</h3>
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>Package Name:</strong> ${bookingDetails.selectedPackage.name}</p>
              <p style="margin: 5px 0;"><strong>Price:</strong> ${formatPrice(bookingDetails.selectedPackage.price)}</p>
              ${bookingDetails.selectedPackage.duration ? `<p style="margin: 5px 0;"><strong>Duration:</strong> ${bookingDetails.selectedPackage.duration}</p>` : ''}
            </div>
            ${bookingDetails.selectedPackage.description ? `
              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Description:</strong></p>
                <p style="margin: 5px 0; color: #555; font-style: italic;">${bookingDetails.selectedPackage.description}</p>
              </div>
            ` : ''}
            ${bookingDetails.selectedPackage.inclusions ? `
              <div>
                <p style="margin: 5px 0;"><strong>Inclusions:</strong></p>
                <p style="margin: 5px 0; color: #555; font-style: italic;">${bookingDetails.selectedPackage.inclusions}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <p>You will receive an email notification once your booking has been reviewed.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>The Meetly Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email notification");
  }
}; 