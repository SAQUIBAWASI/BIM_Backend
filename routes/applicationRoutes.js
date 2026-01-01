import express from "express";
import { createApplication, getAllApplications } from "../controllers/applicationController.js";

const router = express.Router();

// POST /api/applications - Submit form
router.post("/", createApplication);

// GET /api/applications - Admin view
router.get("/", getAllApplications);

export default router;
