# Mailer Setup Guide for Meetly

## Overview

Your Meetly project has a well-structured email service using **Nodemailer** with **Gmail SMTP**. This guide will help you configure it for both development and production environments.

## Current Setup

✅ **Already Implemented:**
- Nodemailer package installed (`nodemailer: ^7.0.5`)
- Email service in `backend/src/services/email.service.ts`
- Two email functions: `sendBookingConfirmationEmail` and `sendBookingReceivedEmail`
- Gmail SMTP configuration for both development and production
- Professional HTML email templates

## Step 1: Environment Variables

Create a `.env` file in your `backend` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres.<>:<>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# JWT Configuration
JWT_SECRET="jwt_secret_key"
JWT_EXPIRES_IN="1d"

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="http://localhost:8000/api/integration/google/callback"

# Frontend URLs
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_INTEGRATION_URL="http://localhost:5173/app/integrations"

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Step 2: Gmail Setup

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security → 2-Step Verification
- Enable 2-Factor Authentication if not already enabled

### 2. Generate an App Password
- Go to Google Account settings
- Security → 2-Step Verification → App passwords
- Select "Mail" as the app
- Generate a 16-digit password
- Copy this password (you'll only see it once)

### 3. Update Your Environment Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

## Step 3: Testing the Mailer

### Method 1: Create a Test Booking
1. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Go to your frontend application
3. Create a test booking through the UI
4. Check your email inbox for the confirmation email

### Method 2: Check Console Logs
When emails are sent, you'll see:
```
Email sent successfully to: user@example.com
```

### Method 3: Verify Email Delivery
- Check your Gmail inbox
- Look for emails from your configured `EMAIL_USER`
- Verify the HTML formatting is correct

## Step 4: Email Templates

Your current email templates are in `backend/src/services/email.service.ts`:

### Available Functions:
- `sendBookingConfirmationEmail()` - Sends booking status updates
- `sendBookingReceivedEmail()` - Sends booking received confirmation

### Customizing Templates:

The HTML templates are embedded in the functions. You can:
1. **Modify the HTML** directly in the service file
2. **Create separate template files** for better organization
3. **Use a template engine** like Handlebars or EJS

## Step 5: Adding New Email Types

To add new email types, follow this pattern:

```typescript
export const sendNewEmailType = async (
  to: string,
  userName: string,
  // ... other parameters
) => {
  try {
    const transporter = await createTransporter();
    
    const subject = "Your Subject";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Email Title</h2>
        <p>Dear ${userName},</p>
        <!-- Your email content -->
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
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
```

## Troubleshooting

### Common Issues:

1. **"Invalid login" error:**
   - Check your email/password
   - Ensure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled

2. **"Connection timeout":**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

3. **"Email not sending":**
   - Verify environment variables are set correctly
   - Check that `EMAIL_USER` and `EMAIL_PASSWORD` are in your `.env`
   - Ensure the email address is valid

4. **"Authentication failed":**
   - Make sure you're using an App Password, not your regular Gmail password
   - Regenerate the App Password if needed

### Debug Mode:

Add this to see detailed SMTP logs:

```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all sensitive data
3. **Use App Passwords** instead of regular passwords
4. **Rate limit** email sending to prevent abuse
5. **Validate email addresses** before sending

## Production Deployment

### 1. Set Production Environment
```env
NODE_ENV=production
```

### 2. Configure Production Email
- Use the same Gmail setup as development
- Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are set in your hosting platform
- Test email delivery in production

### 3. Monitor Email Delivery
- Check your Gmail sent folder
- Monitor for any bounce-backs
- Set up email delivery monitoring if needed

## Alternative Email Services

If you prefer other email services:

### SendGrid
```typescript
return nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Mailgun
```typescript
return nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS,
  },
});
```

Your mailer is now configured to use Gmail SMTP and ready to send professional emails for your Meetly booking system! 🎉 