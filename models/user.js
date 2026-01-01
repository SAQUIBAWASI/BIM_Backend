import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        mobile: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["partner", "user"],
            default: "user"
        },
        // Partner specific fields
        clinicName: {
            type: String,
            required: function () {
                return this.role === "partner";
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
