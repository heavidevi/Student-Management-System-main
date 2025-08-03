const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { getDB } = require("../config/database");

let otpStore = {}; // This should also be moved to MongoDB

// Show forgot-password form
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', { error: null });
});

// Handle email submission - NEEDS MIGRATION
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // ❌ OLD: Reading from file system
    // const users = JSON.parse(fs.readFileSync(USERS_PATH));
    // const user = users.find(u => u.email === email);

    // ✅ NEW: Reading from MongoDB
    const db = getDB();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.render('auth/forgot-password', { error: 'No account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in MongoDB instead of memory
    await db.collection('otps').insertOne({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      role: user.role,
      createdAt: new Date()
    });

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    req.session.otpEmail = email;
    res.render('auth/verify-otp', { message: 'OTP sent to your email!' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('auth/forgot-password', { error: 'Failed to send OTP. Try again.' });
  }
});

// Show OTP form
router.get('/verify-otp', (req, res) => {
  res.render('auth/verify-otp', { error: null });
});

// Verify OTP - NEEDS MIGRATION
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;
  const email = req.session.otpEmail;

  try {
    const db = getDB();
    
    // ❌ OLD: Check from memory
    // const stored = otpStore[email];

    // ✅ NEW: Check from MongoDB
    const stored = await db.collection('otps').findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!stored) {
      return res.render('auth/verify-otp', { error: 'Invalid or expired OTP.' });
    }

    // Clean up used OTP
    await db.collection('otps').deleteOne({ email, otp });

    req.session.resetEmail = email;
    req.session.userRole = stored.role;
    res.redirect('/reset-password');

  } catch (error) {
    console.error('OTP verification error:', error);
    res.render('auth/verify-otp', { error: 'An error occurred. Please try again.' });
  }
});

// Show reset password form
router.get('/reset-password', (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/login');
  res.render('auth/reset-password', { error: null });
});

// Reset password - NEEDS MIGRATION
router.post('/reset-password', async (req, res) => {
  const { password } = req.body;
  const email = req.session.resetEmail;

  try {
    // ❌ OLD: Update file system
    // const users = JSON.parse(fs.readFileSync(USERS_PATH));
    // const userIndex = users.findIndex(u => u.email === email);
    // users[userIndex].password = await bcrypt.hash(password, 10);
    // fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

    // ✅ NEW: Update MongoDB
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.collection('users').updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    // Clear session
    req.session.resetEmail = null;
    req.session.userRole = null;
    req.session.otpEmail = null;

    res.render('auth/login', { message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.render('auth/reset-password', { error: 'Failed to update password. Try again.' });
  }
});

module.exports = router;