# Mailer Testing Guide for Meetly

## 🧪 How to Test Your Mailer

Your mailer is now ready for testing! Here are several methods to test if it's working correctly.

## Method 1: Quick Test Script (Recommended)

### Step 1: Run the Test Script
```bash
cd backend
node test-mailer.js
```

### Step 2: Check the Output
You should see output like:
```
🔧 Creating test account...
✅ Test account created: abc123@ethereal.email
📧 Sending test email...
✅ Email sent successfully!
📋 Preview URL: https://ethereal.email/message/abc123...
```

### Step 3: View the Email
- Copy the preview URL from the console
- Open it in your browser
- You should see a beautifully formatted test email

## Method 2: API Endpoints (For Integration Testing)

### Start Your Backend
```bash
cd backend
npm run dev
```

### Test Booking Confirmation Email
```bash
curl -X POST http://localhost:8000/api/test/test-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "John Doe",
    "eventTitle": "Math Tutoring Session",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "status": "APPROVED",
    "adminMessage": "Your booking has been approved! See you soon."
  }'
```

### Test Booking Received Email
```bash
curl -X POST http://localhost:8000/api/test/test-booking-received \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Jane Smith",
    "eventTitle": "Science Consultation",
    "startTime": "2024-01-16T14:00:00Z",
    "endTime": "2024-01-16T15:00:00Z"
  }'
```

## Method 3: Frontend Integration Testing

### Step 1: Create a Test Booking
1. Go to your frontend application
2. Navigate to an event's booking page
3. Fill out the booking form
4. Submit the booking
5. Check your backend console for email preview URLs

### Step 2: Check Console Output
When a booking is created, you should see:
```
Preview URL: https://ethereal.email/message/abc123...
```

## Method 4: Using Postman or Similar Tools

### Test Endpoints:
- **URL:** `http://localhost:8000/api/test/test-booking-confirmation`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "your-email@example.com",
  "userName": "Test User",
  "eventTitle": "Test Event",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "APPROVED",
  "adminMessage": "This is a test message"
}
```

## Method 5: Production Testing

### For Gmail Setup:
1. Set `NODE_ENV=production` in your `.env`
2. Configure your Gmail credentials:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```
3. Use the test endpoints with a real email address
4. Check your actual email inbox

### For SendGrid Setup:
1. Set `NODE_ENV=production`
2. Configure SendGrid API key:
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```
3. Test with real email addresses

## 🔍 What to Look For

### ✅ Success Indicators:
- **Development Mode:** Preview URL appears in console
- **Production Mode:** Email arrives in inbox
- **No Error Messages:** Clean console output
- **Proper Formatting:** HTML emails render correctly

### ❌ Common Issues:
- **"Invalid login" error:** Check email/password credentials
- **"Connection timeout":** Check internet connection
- **No preview URL:** Ensure `NODE_ENV=development`
- **Email not sending:** Verify environment variables

## 🛠️ Debugging Tips

### Enable Debug Mode:
Add this to your email service for detailed logs:
```typescript
const transporter = nodemailer.createTransporter({
  // ... your config
  debug: true,
  logger: true
});
```

### Check Environment Variables:
```bash
# In your backend directory
echo $NODE_ENV
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

### Test SMTP Connection:
```bash
# Test if your SMTP server is reachable
telnet smtp.gmail.com 587
```

## 📧 Email Templates Available

Your mailer supports these email types:

1. **Booking Confirmation Email** (`sendBookingConfirmationEmail`)
   - Sent when booking status changes
   - Includes status, event details, and admin message

2. **Booking Received Email** (`sendBookingReceivedEmail`)
   - Sent when a new booking is submitted
   - Confirms receipt and pending approval

## 🎯 Next Steps

1. **Test in Development:** Use the test script or API endpoints
2. **Verify Email Templates:** Check that emails look professional
3. **Test in Production:** Set up real email service (Gmail/SendGrid)
4. **Monitor Logs:** Watch for any email sending errors
5. **Customize Templates:** Modify HTML in `email.service.ts`

## 🚀 Ready to Deploy?

Once testing is complete:
1. Configure production email service
2. Set `NODE_ENV=production`
3. Deploy your application
4. Monitor email delivery in production

Your mailer is now ready to send beautiful, professional emails for your Meetly booking system! 🎉 