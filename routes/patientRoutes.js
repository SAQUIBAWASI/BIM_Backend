


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
    console.log('=== POST /test request ===');
    console.log('Patient ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body));

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const patient = await Patient.findById(req.params.id);
            if (!patient) return res.status(404).json({ error: "Patient not found" });

            const { type, value, value2, sugarType } = req.body;

            // Validate required fields
            if (!type) {
                return res.status(400).json({ error: "Test type is required" });
            }
            if (value === undefined || value === null || value === "") {
                return res.status(400).json({ error: "Test value is required" });
            }

            const newTest = {
                date: new Date(),
                type,
                value: parseFloat(value),
                unit: null
            };

            // ---- Weight Test ----
            if (type === "weight") {
                newTest.unit = "kg";
            }

            // ---- Height Test ----
            else if (type === "height") {
                newTest.unit = "cm";
            }

            // ---- Sugar Test ----
            else if (type === "sugar") {
                newTest.unit = "mg/dL";
                newTest.sugarType = sugarType || "Random"; // Add sugar type
            }

            // ---- BP Test ----
            else if (type === "bp") {
                console.log('Processing BP test...');
                console.log('value (systolic):', value, 'type:', typeof value);
                console.log('value2 (diastolic):', value2, 'type:', typeof value2);

                if (!value2 && value2 !== 0) {
                    console.error('BP validation failed: value2 is missing');
                    return res.status(400).json({ error: "Diastolic BP value is required" });
                }
                newTest.value2 = parseInt(value2);    // diastolic
                newTest.unit = "mmHg";
                console.log('BP test created:', JSON.stringify(newTest));
            }
            else {
                console.error('Invalid test type received:', type);
                return res.status(400).json({ error: "Invalid test type" });
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

            // Try to save - this may fail with version conflict
            await patient.save();

            // FINAL RESPONSE UPDATED (ONLY REQUIRED CHANGE)
            return res.json({
                message: "Test added",
                test: newTest,
                bmi: latestWeight && latestHeight ? {
                    value: calculateBMI(latestWeight.value, latestHeight.value),
                    category: getBMICategory(calculateBMI(latestWeight.value, latestHeight.value))
                } : null
            });

        } catch (err) {
            // Check if it's a version conflict error
            if (err.name === 'VersionError' || (err.message && err.message.includes('version'))) {
                attempt++;
                console.log(`Version conflict detected, retry attempt ${attempt}/${maxRetries}`);

                if (attempt >= maxRetries) {
                    console.error("Max retries reached for version conflict");
                    return res.status(500).json({ error: "Failed to save test due to concurrent updates. Please try again." });
                }

                // Wait a bit before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                continue; // Retry the operation
            }

            // For other errors, log and return immediately
            console.error("Error adding test:", err);
            return res.status(500).json({ error: err.message });
        }
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
// router.patch('/:id/tests/:testId/verify', async (req, res) => {
//     console.log('=== PATCH /verify request ===');
//     console.log('Patient ID:', req.params.id);
//     console.log('Test ID:', req.params.testId);

//     const maxRetries = 3;
//     let attempt = 0;

//     while (attempt < maxRetries) {
//         try {
//             const patient = await Patient.findById(req.params.id);
//             if (!patient) {
//                 console.error('Patient not found:', req.params.id);
//                 return res.status(404).json({ error: "Patient not found" });
//             }

//             console.log('Patient found:', patient.name);
//             console.log('Total tests:', patient.tests.length);

//             const test = patient.tests.id(req.params.testId);
//             if (!test) {
//                 console.error('Test not found:', req.params.testId);
//                 console.log('Available test IDs:', patient.tests.map(t => t._id.toString()));
//                 return res.status(404).json({ error: "Test not found" });
//             }

//             console.log('Test found:', test.type, test.value);
//             console.log('Current verification status:', test.doctorVerification);

//             test.doctorVerification = {
//                 status: "approved",
//                 approvedBy: req.body.doctor || "Doctor",
//                 approvedAt: new Date()
//             };

//             console.log('Updated verification:', test.doctorVerification);
//             console.log('Attempting to save patient...');

//             await patient.save();

//             console.log('Patient saved successfully!');
//             return res.json({ message: "Verified", patient });

//         } catch (err) {
//             console.error('=== ERROR in PATCH /verify ===');
//             console.error('Error name:', err.name);
//             console.error('Error message:', err.message);
//             console.error('Stack:', err.stack);

//             // Check if it's a version conflict error
//             if (err.name === 'VersionError' || (err.message && err.message.includes('version'))) {
//                 attempt++;
//                 console.log(`Version conflict detected, retry attempt ${attempt}/${maxRetries}`);

//                 if (attempt >= maxRetries) {
//                     console.error("Max retries reached for version conflict");
//                     return res.status(500).json({ error: "Failed to verify due to concurrent updates. Please try again." });
//                 }

//                 await new Promise(resolve => setTimeout(resolve, 100 * attempt));
//                 continue;
//             }

//             // For other errors, return immediately
//             console.error('Returning 500 error to client');
//             return res.status(500).json({ error: err.message });
//         }
//     }

//     // Fallback
//     console.error('WARNING: While loop exited without return!');
//     return res.status(500).json({ error: "Unexpected error" });
// });


router.patch('/:id/tests/:testId/verify', async (req, res) => {
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
            approvedBy: req.body?.doctor || "Doctor", // ✅ FIXED
            approvedAt: new Date()
        };

        await patient.save();

        res.json({ message: "Test verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


export default router;
