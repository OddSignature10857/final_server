// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./route/auth.js";  

dotenv.config();  

const app = express();

app.use(cors());

app.use(express.json());

 const dbUrl = process.env.DB_URL || 'mongodb+srv://workspace2000official_db_user:LS6VN3H8vyeE8ga0@custommatt.md8xkma.mongodb.net/?retryWrites=true&w=majority&appName=custommatt';

// const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes); 

console.log("Server is up and running!");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
