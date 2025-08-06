// Simple script to test the mailer functionality
// Run this with: node test-mailer.js

const nodemailer = require('nodemailer');

// Test function to create a test account and send an email
async function testMailer() {
  try {
    console.log('🔧 Creating test account...');
    
    // Create a test account (Ethereal Email)
    const testAccount = await nodemailer.createTestAccount();
    console.log('✅ Test account created:', testAccount.user);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('📧 Sending test email...');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"Meetly Test" <test@example.com>',
      to: "test@example.com",
      subject: "Test Email from Meetly Mailer",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email to verify that the mailer is working correctly.</p>
          <p>If you can see this email, your mailer setup is working! 🎉</p>
          <p>Best regards,<br>The Meetly Team</p>
        </div>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\n🌐 Open the preview URL in your browser to see the email');
    
  } catch (error) {
    console.error('❌ Error testing mailer:', error);
  }
}

// Run the test
testMailer(); 