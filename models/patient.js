// import mongoose from 'mongoose';

// const testSchema = new mongoose.Schema({
//   date: { type: Date, default: Date.now },

//   // Generic concept (Event Sourcing style)
//   type: { type: String, required: true }, // weight, height, sugar, bp, bmi
//   value: { type: Number, required: true },
//   value2: { type: Number }, // For BP diastolic
//   unit: { type: String },
//   category: { type: String }, // For BMI result
//   sugarType: { type: String }, // For Sugar test type (Fasting, Random, PPBS)

//   // Old fields for backward compatibility or if we want to store calculated analysis in the test event?
//   // ideally we keep it simple as per new controller logic.

//   // Doctor Verification
//   doctorVerification: {
//     status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
//     approvedBy: { type: String, default: null },
//     approvedAt: { type: Date }
//   }
// });

// const patientSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   age: { type: Number, required: true },
//   gender: { type: String, enum: ['male', 'female'], required: true },
//   contact: { type: String, required: true },
//   address: { type: String, required: true }, // Added Address

//   tests: [testSchema]
// }, {
//   timestamps: true
// });

// export default mongoose.model('Patient', patientSchema);

// import mongoose from "mongoose";

// const testSchema = new mongoose.Schema({
//   type: String,
//   value: Number,
//   value2: Number,
//   sugarType: String,
//   unit: String,
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// const patientSchema = new mongoose.Schema(
//   {
//     name: String,
//     age: Number,
//     gender: String,
//     contact: String,
//     address: String,

//     // ✅ CURRENT VALUES (PDF & REPORT yahin se banegi)
//     vitals: {
//       weight: Number,
//       height: Number,
//       sugar: Number,
//       sugarType: String,
//       bpSys: Number,
//       bpDia: Number,
//       bmi: Number,
//       bmiCategory: String,
//       updatedAt: Date
//     },

//     // ✅ HISTORY (Recent Entries)
//     tests: [testSchema]
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Patient", patientSchema);


import mongoose from "mongoose";

/* -----------------------------
   TEST SCHEMA
----------------------------- */
const testSchema = new mongoose.Schema({
  type: String,
  value: Number,
  value2: Number,
  sugarType: String,
  unit: String,
  date: {
    type: Date,
    default: Date.now
  }
});

/* -----------------------------
   PATIENT SCHEMA
----------------------------- */
const patientSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: String,
    contact: String,
    address: String,
    // ✅ CAMP RELATION (IMPORTANT)
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
      required: true
    },

    // ✅ CURRENT VALUES (PDF / REPORT yahin se)
    vitals: {
      weight: Number,
      height: Number,
      sugar: Number,
      sugarType: String,
      bpSys: Number,
      bpDia: Number,
      bmi: Number,
      bmiCategory: String,
      updatedAt: Date
    },

    // ✅ HISTORY (ALL TEST RECORDS)
    tests: [testSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
