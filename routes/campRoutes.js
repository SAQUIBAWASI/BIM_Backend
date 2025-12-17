// import express from "express";
// import Camp from "../models/camp.js"; // 👈 .js EXTENSION IMPORTANT

// const router = express.Router();

// /* ➕ ADD CAMP */
// router.post("/addcamp", async (req, res) => {
//   try {
//     const camp = await Camp.create(req.body);
//     res.status(201).json(camp);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /* 📄 GET ALL CAMPS */
// router.get("/allcamps", async (req, res) => {
//   const camps = await Camp.find().sort({ createdAt: -1 });
//   res.json(camps);
// });

// export default router;

import express from "express";
import Camp from "../models/camp.js";

const router = express.Router();

/* ➕ ADD CAMP */
router.post("/addcamp", async (req, res) => {
  try {
    const camp = await Camp.create(req.body);
    res.status(201).json(camp);
  } catch (err) {
    console.error("ADD CAMP ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

/* 📄 GET ALL CAMPS */
router.get("/allcamps", async (req, res) => {
  try {
    console.log("✅ GET /allcamps hit");
    const camps = await Camp.find().sort({ createdAt: -1 });
    res.json(camps);
  } catch (err) {
    console.error("GET CAMPS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
