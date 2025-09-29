import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

// Register User

// Create a reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Transporter Error:", error);
  } else {
    console.log("SMTP Transporter Ready");
  }
});

// Register User
export const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    accountType,
    firstName,
    lastName,
    referralName,
    hearAbout,
    licenseNumber,
    businessNumber,
    licensedState,
    zipCode,
    joinSociety = false,
  } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    !accountType ||
    !firstName ||
    !lastName ||
    !hearAbout
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({
      username,
      email,
      password,
      accountType,
      firstName,
      lastName,
      referralName,
      hearAbout,
      licenseNumber:
        accountType === "licensedStylist" ? licenseNumber : undefined,
      businessNumber: accountType === "salonOwner" ? businessNumber : undefined,
      licensedState:
        accountType === "licensedStylist" || accountType === "salonOwner"
          ? licensedState
          : undefined,
      zipCode:
        accountType === "licensedStylist" || accountType === "salonOwner"
          ? zipCode
          : undefined,
      joinSociety,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    try {
      console.log(`Attempting to send email to ${email} using Gmail SMTP`);
      const mailOptions = {
        from: `"Our Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Our Store! Account Created Successfully",
        text: `Hello ${firstName} ${lastName} ,

Welcome to Our Store! Your account has been created successfully.

Account Details:
- Email: ${email}
- Username: ${username}
- Account Type: ${accountType}

If you have any questions, reply to this email.

Best regards,
Md. Manowar Hossain`,
        html: `<h1>Hello ${firstName} ${lastName} (${username})!</h1>
               <h3>Welcome to our Store! Your account has been created successfully.</h3>
               <ul>
                 <li><strong>Email:</strong> ${email}</li>
                 <li><strong>Username:</strong> ${username}</li>
                 <li><strong>Account Type:</strong> ${accountType}</li>
               </ul>
               <p>If you have any questions, reply to this email.</p>
               <p>Best regards,<br>Md. Manowar Hossain</p>
               <p>Devloper</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Login User

export const loginUser = async (req, res) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "1st Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "2nd Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Fetch User Data (new endpoint)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Fetch All Users (new endpoint)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({ message: "All users deleted successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


  export const searchByZipCode = async (req, res) => {
  let { zipCode } = req.query;

  if (!zipCode) {
    return res.status(400).json({ message: 'Zip code is required' });
  }

 
  zipCode = zipCode.trim();
  console.log('Received zipCode:', zipCode);

  // Validate zip code format
  const zipCodeRegex = /^\d{5}(-\d{4})?$/;
  if (!zipCodeRegex.test(zipCode)) {
    console.log('Invalid zip code format:', zipCode);
    return res.status(400).json({ message: 'Invalid zip code format. Use 12345 or 12345-6789' });
  }

  try {
    const users = await User.find({
      zipCode,
      accountType: { $in: ['licensedStylist', 'salonOwner'] },
    }).select('username email firstName lastName preferredName accountType zipCode licensedState');

    if (users.length === 0) {
      console.log(`No users found for zipCode: ${zipCode}`);
      return res.status(404).json({ message: 'No users found for this zip code' });
    }

    console.log(`Found ${users.length} users for zipCode: ${zipCode}`);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};