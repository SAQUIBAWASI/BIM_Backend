import Application from "../models/application.js";

/* =========================================
   CREATE APPLICATION
   ========================================= */
export const createApplication = async (req, res) => {
    try {
        const { name, mobile, email, type, message, userId } = req.body;

        if (!name || !mobile || !type) {
            return res.status(400).json({ message: "Name, Mobile, and Type are required" });
        }

        const newApp = new Application({
            name,
            mobile,
            email,
            type,
            message,
            userId, // Optional: connect to logged-in user
        });

        await newApp.save();

        res.status(201).json({ message: "Application submitted successfully", application: newApp });
    } catch (err) {
        console.error("Create App Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   GET ALL APPLICATIONS (ADMIN)
   ========================================= */
export const getAllApplications = async (req, res) => {
    try {
        const apps = await Application.find().sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (err) {
        console.error("Get Apps Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
