


// import express from 'express';
// import Patient from '../models/patient.js';

// const router = express.Router();

// /* -----------------------------------------------------
//   BMI CALCULATION FUNCTION
// ------------------------------------------------------ */
// const calculateBMI = (weight, height) => {
//     if (!weight || !height) return null;
//     const h = height / 100;
//     return (weight / (h * h)).toFixed(1);
// };

// const getBMICategory = (bmi) => {
//     if (!bmi) return "N/A";

//     const b = parseFloat(bmi);

//     if (b < 18.5) return "Underweight";
//     if (b < 25) return "Healthy";
//     if (b < 30) return "Overweight";
//     if (b < 35) return "Obese";
//     return "Extremely Obese";
// };

// /* -----------------------------------------------------
//   1. GET ALL PATIENTS
// ------------------------------------------------------ */
// router.get('/', async (req, res) => {
//     try {
//         const patients = await Patient.find().sort({ createdAt: -1 });

//         const data = patients.map(p => ({
//             _id: p._id,
//             name: p.name,
//             age: p.age,
//             gender: p.gender,
//             contact: p.contact,
//             testCount: p.tests.length,
//             lastTest: p.tests[p.tests.length - 1]?.date || null
//         }));

//         res.json(data);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /* -----------------------------------------------------
//   2. GET SINGLE PATIENT
// ------------------------------------------------------ */
// router.get('/:id', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ error: "Patient not found" });
//         res.json(patient);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /* -----------------------------------------------------
//   3. CREATE PATIENT
// ------------------------------------------------------ */
// router.post('/', async (req, res) => {
//     try {
//         const patient = new Patient({
//             name: req.body.name,
//             age: req.body.age,
//             gender: req.body.gender,
//             contact: req.body.contact,
//             address: req.body.address,
//             tests: []
//         });

//         const saved = await patient.save();
//         res.status(201).json(saved);

//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// /* -----------------------------------------------------
//   4. ADD TEST (WEIGHT / HEIGHT / SUGAR / BP)
// ------------------------------------------------------ */

// router.post('/:id/test', async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id);
//     if (!patient) return res.status(404).json({ error: "Patient not found" });

//     const { type, value, value2, sugarType } = req.body;

//     if (!type || value === undefined) {
//       return res.status(400).json({ error: "Invalid test data" });
//     }

//     // --------------------
//     // SAVE TEST HISTORY
//     // --------------------
//     const newTest = {
//       type,
//       value: parseFloat(value),
//       date: new Date()
//     };

//     if (type === "bp") {
//       if (!value2) {
//         return res.status(400).json({ error: "Diastolic value required" });
//       }
//       newTest.value2 = parseInt(value2);
//       newTest.unit = "mmHg";
//     }

//     if (type === "weight") newTest.unit = "kg";
//     if (type === "height") newTest.unit = "cm";
//     if (type === "sugar") {
//       newTest.unit = "mg/dL";
//       newTest.sugarType = sugarType || "Random";
//     }

//     patient.tests.push(newTest);

//     // --------------------
//     // UPDATE CURRENT VITALS ✅
//     // --------------------
//     if (!patient.vitals) patient.vitals = {};

//     if (type === "weight") patient.vitals.weight = newTest.value;
//     if (type === "height") patient.vitals.height = newTest.value;
//     if (type === "sugar") {
//       patient.vitals.sugar = newTest.value;
//       patient.vitals.sugarType = newTest.sugarType;
//     }
//     if (type === "bp") {
//       patient.vitals.bpSys = newTest.value;
//       patient.vitals.bpDia = newTest.value2;
//     }

//     // --------------------
//     // AUTO BMI (FROM VITALS)
//     // --------------------
//     const { weight, height } = patient.vitals;

//     if (weight && height) {
//       const h = height / 100;
//       const bmi = (weight / (h * h)).toFixed(1);

//       let category = "Healthy";
//       if (bmi < 18.5) category = "Underweight";
//       else if (bmi >= 25 && bmi < 30) category = "Overweight";
//       else if (bmi >= 30) category = "Obese";

//       patient.vitals.bmi = parseFloat(bmi);
//       patient.vitals.bmiCategory = category;
//     }

//     patient.vitals.updatedAt = new Date();

//     await patient.save();

//     res.json({
//       message: "Test added successfully",
//       vitals: patient.vitals
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /* -----------------------------------------------------
//   5. GET ALL TESTS OF PATIENT
// ------------------------------------------------------ */
// router.get('/:id/tests', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ error: "Patient not found" });

//         res.json(patient.tests);

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /* -----------------------------------------------------
//   6. DELETE PATIENT
// ------------------------------------------------------ */
// router.delete('/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /* -----------------------------------------------------
//   7. DOCTOR VERIFICATION
// ------------------------------------------------------ */
// // router.patch('/:id/tests/:testId/verify', async (req, res) => {
// //     console.log('=== PATCH /verify request ===');
// //     console.log('Patient ID:', req.params.id);
// //     console.log('Test ID:', req.params.testId);

// //     const maxRetries = 3;
// //     let attempt = 0;

// //     while (attempt < maxRetries) {
// //         try {
// //             const patient = await Patient.findById(req.params.id);
// //             if (!patient) {
// //                 console.error('Patient not found:', req.params.id);
// //                 return res.status(404).json({ error: "Patient not found" });
// //             }

// //             console.log('Patient found:', patient.name);
// //             console.log('Total tests:', patient.tests.length);

// //             const test = patient.tests.id(req.params.testId);
// //             if (!test) {
// //                 console.error('Test not found:', req.params.testId);
// //                 console.log('Available test IDs:', patient.tests.map(t => t._id.toString()));
// //                 return res.status(404).json({ error: "Test not found" });
// //             }

// //             console.log('Test found:', test.type, test.value);
// //             console.log('Current verification status:', test.doctorVerification);

// //             test.doctorVerification = {
// //                 status: "approved",
// //                 approvedBy: req.body.doctor || "Doctor",
// //                 approvedAt: new Date()
// //             };

// //             console.log('Updated verification:', test.doctorVerification);
// //             console.log('Attempting to save patient...');

// //             await patient.save();

// //             console.log('Patient saved successfully!');
// //             return res.json({ message: "Verified", patient });

// //         } catch (err) {
// //             console.error('=== ERROR in PATCH /verify ===');
// //             console.error('Error name:', err.name);
// //             console.error('Error message:', err.message);
// //             console.error('Stack:', err.stack);

// //             // Check if it's a version conflict error
// //             if (err.name === 'VersionError' || (err.message && err.message.includes('version'))) {
// //                 attempt++;
// //                 console.log(`Version conflict detected, retry attempt ${attempt}/${maxRetries}`);

// //                 if (attempt >= maxRetries) {
// //                     console.error("Max retries reached for version conflict");
// //                     return res.status(500).json({ error: "Failed to verify due to concurrent updates. Please try again." });
// //                 }

// //                 await new Promise(resolve => setTimeout(resolve, 100 * attempt));
// //                 continue;
// //             }

// //             // For other errors, return immediately
// //             console.error('Returning 500 error to client');
// //             return res.status(500).json({ error: err.message });
// //         }
// //     }

// //     // Fallback
// //     console.error('WARNING: While loop exited without return!');
// //     return res.status(500).json({ error: "Unexpected error" });
// // });


// router.patch('/:id/tests/:testId/verify', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) {
//             return res.status(404).json({ error: "Patient not found" });
//         }

//         const test = patient.tests.id(req.params.testId);
//         if (!test) {
//             return res.status(404).json({ error: "Test not found" });
//         }

//         test.doctorVerification = {
//             status: "approved",
//             approvedBy: req.body?.doctor || "Doctor", // ✅ FIXED
//             approvedAt: new Date()
//         };

//         await patient.save();

//         res.json({ message: "Test verified successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });


// export default router;


import express from "express";
import Camp from "../models/camp.js";
import Patient from "../models/patient.js";



const router = express.Router();

/* -----------------------------------------------------
  BMI CALCULATION FUNCTIONS
------------------------------------------------------ */
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return "N/A";
  const b = parseFloat(bmi);

  if (b < 18.5) return "Underweight";
  if (b < 25) return "Healthy";
  if (b < 30) return "Overweight";
  if (b < 35) return "Obese";
  return "Extremely Obese";
};

/* -----------------------------------------------------
  1️⃣ GET ALL PATIENTS (WITH CAMP DETAILS ✅)
------------------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("campId", "name location")
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------
  2️⃣ GET SINGLE PATIENT
------------------------------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "campId",
      "name location"
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------
  3️⃣ CREATE PATIENT (campId FIXED ✅)
------------------------------------------------------ */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      contact,
      address,
      campId,
      campName
    } = req.body;

    let finalCampId = campId;

    if (!finalCampId) {
      if (!campName) {
        return res.status(400).json({ error: "campId or campName is required" });
      }

      const camp = await Camp.findOne({ name: campName });
      if (!camp) {
        return res.status(404).json({ error: "Camp not found" });
      }

      finalCampId = camp._id;
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      address,
      campId: finalCampId,
      tests: [],
      vitals: {}
    });

    res.status(201).json(patient);

  } catch (err) {
    console.error("CREATE PATIENT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
});




/* -----------------------------------------------------
  4️⃣ ADD TEST (WEIGHT / HEIGHT / SUGAR / BP)
------------------------------------------------------ */
router.post("/:id/test", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const { type, value, value2, sugarType } = req.body;

    if (!type || value === undefined) {
      return res.status(400).json({ error: "Invalid test data" });
    }

    const newTest = {
      type,
      value: parseFloat(value),
      date: new Date()
    };

    if (type === "bp") {
      if (!value2) {
        return res.status(400).json({ error: "Diastolic value required" });
      }
      newTest.value2 = parseInt(value2);
      newTest.unit = "mmHg";
    }

    if (type === "weight") newTest.unit = "kg";
    if (type === "height") newTest.unit = "cm";
    if (type === "sugar") {
      newTest.unit = "mg/dL";
      newTest.sugarType = sugarType || "Random";
    }

    patient.tests.push(newTest);

    /* ---------- UPDATE VITALS ---------- */
    if (!patient.vitals) patient.vitals = {};

    if (type === "weight") patient.vitals.weight = newTest.value;
    if (type === "height") patient.vitals.height = newTest.value;

    if (type === "sugar") {
      patient.vitals.sugar = newTest.value;
      patient.vitals.sugarType = newTest.sugarType;
    }

    if (type === "bp") {
      patient.vitals.bpSys = newTest.value;
      patient.vitals.bpDia = newTest.value2;
    }

    /* ---------- AUTO BMI ---------- */
    const { weight, height } = patient.vitals;
    if (weight && height) {
      const bmi = calculateBMI(weight, height);
      patient.vitals.bmi = parseFloat(bmi);
      patient.vitals.bmiCategory = getBMICategory(bmi);
    }

    patient.vitals.updatedAt = new Date();

    await patient.save();

    res.json({
      message: "Test added successfully",
      vitals: patient.vitals
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------
  5️⃣ GET ALL TESTS OF PATIENT
------------------------------------------------------ */
router.get("/:id/tests", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient.tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------
  6️⃣ DELETE PATIENT
------------------------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------
  7️⃣ VERIFY TEST (DOCTOR)
------------------------------------------------------ */
router.patch("/:id/tests/:testId/verify", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const test = patient.tests.id(req.params.testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    test.doctorVerification = {
      status: "approved",
      approvedBy: req.body?.doctor || "Doctor",
      approvedAt: new Date()
    };

    await patient.save();
    res.json({ message: "Test verified successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
