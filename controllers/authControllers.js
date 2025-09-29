import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";  // ES6 import for the User model
import mongoose from "mongoose";

// Register User

export const registerUser = async (req, res) => {
  const { username, email, password, accountType, firstName, lastName, referralName, hearAbout, licenseNumber, businessNumber, licensedState, zipCode, joinSociety = false } = req.body;

  if (!username || !email || !password || !accountType || !firstName || !lastName || !hearAbout) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user (rely on pre-save hook for hashing)
    const newUser = new User({
      username,
      email,
      password, // Pass plain text password
      accountType,
      firstName,
      lastName,
      referralName,
      hearAbout,
      licenseNumber: accountType === 'licensedStylist' ? licenseNumber : undefined,
      businessNumber: accountType === 'salonOwner' ? businessNumber : undefined,
      licensedState: (accountType === 'licensedStylist' || accountType === 'salonOwner') ? licensedState : undefined,
      zipCode: (accountType === 'licensedStylist' || accountType === 'salonOwner') ? zipCode : undefined,
      joinSociety,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User

export const loginUser = async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '1st Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '2nd Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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