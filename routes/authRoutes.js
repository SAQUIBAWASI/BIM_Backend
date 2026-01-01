import express from "express";
import { login, register, getAllPartners } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/partners", getAllPartners);

export default router;
