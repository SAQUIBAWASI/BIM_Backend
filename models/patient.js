import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  
  // Generic concept (Event Sourcing style)
  type: { type: String, required: true }, // weight, height, sugar, bp, bmi
  value: { type: Number, required: true },
  value2: { type: Number }, // For BP diastolic
  unit: { type: String },
  category: { type: String }, // For BMI result

  // Old fields for backward compatibility or if we want to store calculated analysis in the test event?
  // ideally we keep it simple as per new controller logic.

  // Doctor Verification
  doctorVerification: {
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date }
  }
});

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true }, // Added Address
  
  tests: [testSchema]
}, { 
  timestamps: true 
});

export default mongoose.model('Patient', patientSchema);