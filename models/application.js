import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String }, // Optional, good for contact
        type: {
            type: String,
            enum: ["camp", "volunteer"],
            required: true,
        },
        message: { type: String }, // Optional message/details
        campName: { type: String }, // Optional camp name for participation
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link if logged in
    },
    { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
