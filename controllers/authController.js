import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/* =========================================
   REGISTER
   ========================================= */
export const register = async (req, res) => {
    try {
        const { name, email, password, mobile, address, role, clinicName } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Role validation
        if (role === "partner" && !clinicName) {
            return res.status(400).json({ message: "Clinic Name is required for Partners" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            address,
            role: role || "user",
            clinicName: role === "partner" ? clinicName : undefined,
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully", user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   LOGIN
   ========================================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate Token (simple secret for now, ideally in .env)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "supersecretkey123",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                clinicName: user.clinicName
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/* =========================================
   GET ALL PARTNERS
   ========================================= */
export const getAllPartners = async (req, res) => {
    try {
        console.log("Fetching partners...");
        const partners = await User.find({ role: "partner" }).select("-password");
        console.log(`Found ${partners.length} partners.`);
        res.status(200).json(partners);
    } catch (err) {
        console.error("Get Partners Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
