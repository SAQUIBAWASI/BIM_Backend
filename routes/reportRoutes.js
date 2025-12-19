import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure folder exists
const uploadDir = path.join(__dirname, "../public/reports");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueName = `report-${Date.now()}.pdf`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF allowed"));
        }
        cb(null, true);
    }
});

// 🚀 Upload API
router.post("/upload", upload.single("file"), (req, res) => {
    try {
        const fileUrl = `${req.protocol}://${req.get("host")}/reports/${req.file.filename}`;

        res.json({
            success: true,
            downloadLink: fileUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

export default router;
