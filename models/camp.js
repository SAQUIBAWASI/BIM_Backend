  import mongoose from "mongoose";

  const campSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true   // Camp-1, Camp-2
      },
      location: {
        type: String,
        required: true   // Tolichowki
      },
      address: String,
      date: String,      // 12-12-2025
      time: String       // 10:00 AM - 4:00 PM
    },
    { timestamps: true }
  );

  export default mongoose.model("Camp", campSchema);
