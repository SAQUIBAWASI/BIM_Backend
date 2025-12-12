// import express from 'express';
// import Patient from '../models/patient.js';

// const router = express.Router();

// // --- HELPER: CALCULATE HEALTH ---
// const calculateHealth = (data) => {
//     let { weight, height, sugar, bpSystolic, bpDiastolic, rbs, temperature } = data;

//     // 1. BMI
//     const heightInMeters = height / 100;
//     const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

//     let bmiCategory = "";
//     if (bmi < 18.5) bmiCategory = "Underweight";
//     else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = "Normal";
//     else if (bmi >= 25 && bmi <= 29.9) bmiCategory = "Overweight";
//     else bmiCategory = "Obese";

//     // 2. Analysis
//     let sugarStatus = (sugar >= 70 && sugar <= 100) ? "Normal" : (sugar < 70 ? "Low" : "High");
    
//     let bpStatus = "Normal";
//     if (bpSystolic > 140 || bpDiastolic > 90) bpStatus = "High";
//     else if (bpSystolic < 90 || bpDiastolic < 60) bpStatus = "Low";

//     let rbsStatus = (rbs < 140) ? "Normal" : "High";

//     let tempStatus = (temperature >= 97 && temperature <= 99) ? "Normal" : (temperature > 99 ? "High (Fever)" : "Low");

//     // 3. Overall Status
//     let healthStatus = "Healthy";
//     const criticalConditions = [
//       bmiCategory === "Obese",
//       sugarStatus !== "Normal", // Simplified for "Critical" check
//       bpStatus === "High",
//       rbsStatus === "High",
//       tempStatus === "High (Fever)"
//     ];
    
//     // Logic: 2+ issues = Critical, 1 issue = Need Attention
//     let issues = 0;
//     if(bmiCategory === "Obese" || bmiCategory === "Underweight") issues++;
//     if(sugarStatus !== "Normal") issues++;
//     if(bpStatus !== "Normal") issues++;
//     if(rbsStatus === "High") issues++;
//     if(tempStatus !== "Normal") issues++;

//     if (issues >= 2) healthStatus = "Critical";
//     else if (issues === 1) healthStatus = "Need Attention";

//     return {
//         bmi, bmiCategory, healthStatus,
//         analysis: { bmiStatus: bmiCategory, sugarStatus, bpStatus, rbsStatus, tempStatus }
//     };
// };

// // 1. GET ALL PATIENTS (Dashboard)
// router.get('/', async (req, res) => {
//   try {
//     const patients = await Patient.find().sort({ createdAt: -1 });
//     // Transform to send only needed info + test count
//     const dashboardData = patients.map(p => ({
//         _id: p._id,
//         name: p.name,
//         age: p.age,
//         gender: p.gender,
//         contact: p.contact,
//         testCount: p.tests.length,
//         lastTest: p.tests[p.tests.length - 1]?.date // Optional: show last visit
//     }));
//     res.json(dashboardData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 2. GET SINGLE PATIENT (Details + History)
// router.get('/:id', async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id);
//     if (!patient) return res.status(404).json({ error: 'Patient not found' });
//     res.json(patient);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 3. CREATE PATIENT (Add Patient Page)
// router.post('/', async (req, res) => {
//   try {
//     // Expects: { name, age, gender, contact }
//     const patient = new Patient({
//         name: req.body.name,
//         age: req.body.age,
//         gender: req.body.gender,
//         contact: req.body.contact,
//         tests: []
//     });
//     const savedPatient = await patient.save();
//     res.status(201).json(savedPatient);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // 4. ADD TEST RECORD (Patient Details Page)
// // CHANGED: Path from /:id/test to /:id/tests to match Frontend
// router.post('/:id/tests', async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id);
//     if (!patient) return res.status(404).json({ error: 'Patient not found' });

//     // Calculate Health Data
//     const healthData = calculateHealth(req.body);

//     const newTest = {
//         ...req.body, // weight, height, sugar, etc.
//         ...healthData,
//         date: new Date()
//     };

//     patient.tests.push(newTest);
//     const updatedPatient = await patient.save();
    
//     res.status(201).json(updatedPatient); 
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // 5. DELETE PATIENT
// router.delete('/:id', async (req, res) => {
//   try {
//     await Patient.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Patient deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;


import express from 'express';
import Patient from '../models/patient.js';

const router = express.Router();

/* -----------------------------------------------------
  BMI CALCULATION FUNCTION
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
  1. GET ALL PATIENTS
------------------------------------------------------ */
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });

        const data = patients.map(p => ({
            _id: p._id,
            name: p.name,
            age: p.age,
            gender: p.gender,
            contact: p.contact,
            testCount: p.tests.length,
            lastTest: p.tests[p.tests.length - 1]?.date || null
        }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  2. GET SINGLE PATIENT
------------------------------------------------------ */
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  3. CREATE PATIENT
------------------------------------------------------ */
router.post('/', async (req, res) => {
    try {
        const patient = new Patient({
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender,
            contact: req.body.contact,
            address: req.body.address,
            tests: []
        });

        const saved = await patient.save();
        res.status(201).json(saved);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  4. ADD TEST (WEIGHT / HEIGHT / SUGAR / BP)
------------------------------------------------------ */

router.post('/:id/test', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        const { type, value, value2 } = req.body;

        const newTest = {
            date: new Date(),
            type,
            unit: null
        };

        // ---- Weight Test ----
        if (type === "weight") {
            newTest.value = value;
            newTest.unit = "kg";
        }

        // ---- Height Test ----
        if (type === "height") {
            newTest.value = value;
            newTest.unit = "cm";
        }

        // ---- Sugar Test ----
        if (type === "sugar") {
            newTest.value = value;
            newTest.unit = "mg/dL";
        }

        // ---- BP Test ----
        if (type === "bp") {
            newTest.value = value;      // systolic
            newTest.value2 = value2;    // diastolic
            newTest.unit = "mmHg";
        }

        // ------------------------------
        // PUSH TEST
        // ------------------------------
        patient.tests.push(newTest);

        // ------------------------------
        // AUTO BMI CALCULATE (LATEST VALUES)
        // ------------------------------
        const latestWeight = [...patient.tests].filter(t => t.type === "weight").pop();
        const latestHeight = [...patient.tests].filter(t => t.type === "height").pop();

        if (latestWeight && latestHeight) {
            const bmiValue = calculateBMI(latestWeight.value, latestHeight.value);
            const bmiCategory = getBMICategory(bmiValue);

            // Remove old BMI entries
            patient.tests = patient.tests.filter(t => t.type !== "bmi");

            // Add new BMI entry
            patient.tests.push({
                type: "bmi",
                value: bmiValue,
                category: bmiCategory,
                unit: null,
                date: new Date()
            });
        }

        await patient.save();

        // FINAL RESPONSE UPDATED (ONLY REQUIRED CHANGE)
        res.json({
            message: "Test added",
            test: newTest,
            bmi: latestWeight && latestHeight ? {
                value: calculateBMI(latestWeight.value, latestHeight.value),
                category: getBMICategory(calculateBMI(latestWeight.value, latestHeight.value))
            } : null
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  5. GET ALL TESTS OF PATIENT
------------------------------------------------------ */
router.get('/:id/tests', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        res.json(patient.tests);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  6. DELETE PATIENT
------------------------------------------------------ */
router.delete('/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: "Patient deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------------------------------------
  7. DOCTOR VERIFICATION
------------------------------------------------------ */
router.patch('/:id/tests/:testId/verify', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        const test = patient.tests.id(req.params.testId);
        if (!test) return res.status(404).json({ error: "Test not found" });

        test.doctorVerification = {
            status: "approved",
            approvedBy: req.body.doctor || "Doctor",
            approvedAt: new Date()
        };

        await patient.save();
        res.json({ message: "Verified", patient });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
