import express from "express";
import { downloadHealthReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/health-report/:id", downloadHealthReport);

export default router;
