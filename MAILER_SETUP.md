# Mailer Setup Guide for Meetly

## Overview

Your Meetly project already has a well-structured email service using **Nodemailer**. This guide will help you configure it for both development and production environments.

## Current Setup

✅ **Already Implemented:**
- Nodemailer package installed (`nodemailer: ^7.0.5`)
- Email service in `backend/src/services/email.service.ts`
- Two email functions: `sendBookingConfirmationEmail` and `sendBookingReceivedEmail`
- Development mode uses Ethereal Email for testing
- Production mode supports Gmail and other email services

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

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Step 2: Development Setup (Ethereal Email)

For development, the mailer automatically uses **Ethereal Email** (a fake SMTP service):

1. **No additional setup required** - it works out of the box
2. **Preview emails** - Check your console for preview URLs when emails are sent
3. **Test emails** - All emails are captured and can be viewed in the browser

## Step 3: Production Setup

### Option A: Gmail (Recommended for beginners)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Update your `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   ```

### Option B: SendGrid (Recommended for production)

1. **Sign up for SendGrid** (free tier available)
2. **Verify your sender email**
3. **Generate an API key**
4. **Update the email service configuration:**

```typescript
// In backend/src/services/email.service.ts, replace the production transporter:
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

5. **Add to your `.env`:**
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Option C: Other Email Services

The mailer supports any SMTP service. Common alternatives:
- **Mailgun**
- **Amazon SES**
- **Postmark**
- **Resend**

## Step 4: Testing the Mailer

### Test in Development

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Trigger an email** (when a booking is created/updated)
3. **Check console** for preview URL
4. **Open the URL** to see the email

### Test in Production

1. **Set `NODE_ENV=production`** in your environment
2. **Configure your email service** (Gmail, SendGrid, etc.)
3. **Test by creating a booking**

## Step 5: Email Templates

Your current email templates are in `backend/src/services/email.service.ts`:

### Available Functions:
- `sendBookingConfirmationEmail()` - Sends booking status updates
- `sendBookingReceivedEmail()` - Sends booking received confirmation

### Customizing Templates:

The HTML templates are embedded in the functions. You can:
1. **Modify the HTML** directly in the service file
2. **Create separate template files** for better organization
3. **Use a template engine** like Handlebars or EJS

## Step 6: Adding New Email Types

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
      from: config.NODE_ENV === "development" ? "test@example.com" : process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (config.NODE_ENV === "development") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
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
   - For Gmail, ensure you're using an App Password, not your regular password

2. **"Connection timeout":**
   - Check your internet connection
   - Verify SMTP settings

3. **"Preview URL not showing":**
   - Ensure `NODE_ENV=development`
   - Check console for any errors

4. **"Email not sending in production":**
   - Verify environment variables are set
   - Check email service credentials
   - Ensure `NODE_ENV=production`

### Debug Mode:

Add this to see detailed SMTP logs:

```typescript
const transporter = nodemailer.createTransport({
  // ... your config
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

## Next Steps

1. **Choose your email service** (Gmail for testing, SendGrid for production)
2. **Set up environment variables**
3. **Test in development mode**
4. **Deploy and test in production**

Your mailer is now ready to send beautiful, professional emails for your Meetly booking system! 🎉 