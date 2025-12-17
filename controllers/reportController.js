// import PDFDocument from "pdfkit";
import Patient from "../models/patient.js";

export const downloadHealthReport = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // ===== SAFE DATA =====
    const vitals = patient.vitals || {};

    const weight = vitals.weight ?? "-";
    const height = vitals.height ?? "-";
    const sugar = vitals.sugar ?? "-";
    const bpSys = vitals.bpSys ?? "-";
    const bpDia = vitals.bpDia ?? "-";
    const bmi = vitals.bmi ?? "-";
    const bmiCategory = vitals.bmiCategory ?? "-";

    // ===== PDF =====
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Health_Report_${patient.name}.pdf`
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc
      .fontSize(18)
      .text("Health Report", { align: "center" })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Report Date: ${new Date().toLocaleString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    // ===== PATIENT INFO =====
    doc.fontSize(12);
    doc.text(`Patient Name : ${patient.name}`);
    doc.text(`Age : ${patient.age} Years`);
    doc.text(`Gender : ${patient.gender}`);
    doc.text(`Phone : ${patient.contact}`);
    doc.text(`Address : ${patient.address}`);

    doc.moveDown(2);

    // ===== CLINICAL VITALS =====
    doc.fontSize(14).text("Clinical Vitals");
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Weight : ${weight} kg`);
    doc.text(`Height : ${height} cm`);
    doc.text(`Sugar : ${sugar} mg/dL`);
    doc.text(`BP : ${bpSys}/${bpDia} mmHg`);

    doc.moveDown(2);

    // ===== BMI =====
    doc.fontSize(14).text("BMI Analysis");
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`BMI Value : ${bmi}`);
    doc.text(`Category : ${bmiCategory}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
