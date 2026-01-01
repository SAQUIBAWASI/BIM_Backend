// import cors from 'cors';
// import dotenv from 'dotenv';
// import express from 'express';
// import mongoose from 'mongoose';
// import path from "path";
// import { fileURLToPath } from "url";

// import campRoutes from './routes/campRoutes.js';
// import patientRoutes from './routes/patientRoutes.js';
// import reportRoutes from './routes/reportRoutes.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // 🔧 Fix __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Middleware
// app.use(cors());
// app.use(express.json());

// // 📂 Public PDF access
// app.use("/reports", express.static(path.join(__dirname, "public/reports")));

// // Logger
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// // MongoDB
// await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bim-medical');
// console.log('✅ MongoDB connected');

// // Routes
// app.use('/api/patients', patientRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/camps', campRoutes);

// app.get('/', (req, res) => {
//   res.json({ message: 'BIM Medical App API', status: 'running' });
// });

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import campRoutes from "./routes/campRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Import Auth Routes
import applicationRoutes from "./routes/applicationRoutes.js"; // ✅ Import App Routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// ✅ CORS CONFIG (REQUIRED)
// =======================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://bm-frontend-lyart.vercel.app",
  "https://attendancefrontend.vercel.app",
  "https://timelyhealth.in",
  "https://www.timelyhealth.in"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 🔥 Preflight request fix
app.options("*", cors());

// =======================
// Middlewares
// =======================
app.use(express.json());

// 📂 Public PDF access
app.use("/reports", express.static(path.join(__dirname, "public/reports")));

// Logger (debugging ke liye)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =======================
// MongoDB
// =======================
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ MongoDB connected");

// =======================
// Routes
// =======================
app.use("/api/patients", patientRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/auth", authRoutes); // ✅ Added Auth Routes
app.use("/api/applications", applicationRoutes); // ✅ Added App Routes

// =======================
// Health Check
// =======================
app.get("/", (req, res) => {
  res.json({
    message: "BIM Medical App API",
    status: "running"
  });
});

// =======================
// Server
// =======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
