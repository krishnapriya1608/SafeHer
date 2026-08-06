const PDFDocument = require("pdfkit");

// Streams a PDF incident report for one emergency alert directly to `res`.
// Caller is responsible for auth/ownership checks before calling this.
function streamIncidentReportPdf(res, emergency) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="incident-report-${emergency._id}.pdf"`
  );

  doc.pipe(res);

  doc
    .fontSize(18)
    .text("SafeSphere — Incident Report", { align: "center" })
    .moveDown(0.3);

  doc
    .fontSize(9)
    .fillColor("#666")
    .text(`Generated ${new Date().toLocaleString()}`, { align: "center" })
    .fillColor("#000")
    .moveDown(1.5);

  const row = (label, value) => {
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(label, { continued: true })
      .fillColor("#000")
      .text(`  ${value ?? "—"}`);
    doc.moveDown(0.4);
  };

  doc.fontSize(13).text("Incident Details", { underline: true }).moveDown(0.6);
  row("Report ID:", emergency._id.toString());
  row("Reported by:", `${emergency.username} (${emergency.email})`);
  row("Status:", emergency.status);
  row("Date/Time:", new Date(emergency.createdAt).toLocaleString());
  row("Location:", emergency.address || `${emergency.latitude}, ${emergency.longitude}`);
  row("Coordinates:", `${emergency.latitude}, ${emergency.longitude}`);
  if (emergency.acceptedByName) {
    row("Responded by:", emergency.acceptedByName);
  }
  doc.moveDown(0.6);

  doc.fontSize(13).text("Message", { underline: true }).moveDown(0.5);
  doc.fontSize(10).text(emergency.message || "SOS Emergency Alert").moveDown(1);

  if (emergency.locationHistory?.length) {
    doc.fontSize(13).text("Location History", { underline: true }).moveDown(0.5);
    doc.fontSize(9);
    emergency.locationHistory.forEach((point, i) => {
      doc.text(
        `${i + 1}. ${new Date(point.timestamp).toLocaleString()} — ${point.latitude}, ${point.longitude}`
      );
    });
    doc.moveDown(1);
  }

  doc
    .fontSize(8)
    .fillColor("#999")
    .text(
      "This report is generated from SafeSphere's records and is provided for personal documentation purposes.",
      { align: "left" }
    );

  doc.end();
}

module.exports = { streamIncidentReportPdf };
