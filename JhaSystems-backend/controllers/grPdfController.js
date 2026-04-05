import PDFDocument from "pdfkit";
import GR from "../models/GR.js";
import Organization from "../models/Organization.js";

export const downloadGRPdf = async (req, res) => {
  try {
    const gr = await GR.findById(req.params.id);
    if (!gr) return res.status(404).json({ message: "GR not found" });

    const organization = await Organization.findById(gr.organizationId);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GR-${gr.grNo}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    /* ================= HEADER ================= */
    doc.font("Helvetica-Bold").fontSize(17).fillColor("#2E3A59")
      .text(organization?.companyName || "PARTNER TRANSPORT SERVICES", 150, 25, {
        align: "center", width: 250
      });

    doc.font("Helvetica").fontSize(10).fillColor("black")
      .text(organization?.address || "", 150, 45, {
        align: "center", width: 250
      });

    doc.font("Helvetica").fontSize(10)
      .text(
        `Contact: ${organization?.contactNumber || "-"} | GSTIN: ${organization?.gstin || "-"}`,
        150, 57, { align: "center", width: 250 }
      );

    doc.font("Helvetica").fontSize(12)
      .text(`Date: ${new Date(gr.grDate).toLocaleDateString()}`, 40, 80);

    doc.font("Helvetica-Bold").fontSize(18).fillColor("#D32F2F")
      .text(`L.R No. : ${gr.grNo}`, 40, 70, { align: "right", width: 510 });

    doc.moveTo(40, 95).lineTo(550, 95).stroke("#2E3A59");

    /* ================= CALCULATIONS ================= */
    const charges = gr.charges || {};

    const totalCharges =
      Number(charges.labour || 0) +
      Number(charges.cartage || 0) +
      Number(charges.doorDelivery || 0) +
      Number(charges.insurance || 0) +
      Number(charges.other || 0) +
      Number(charges.freight || 0) +
      Number(charges.lorryFreight || 0) +
      Number(charges.transporterCharge || 0);

    const gstPercent = Number(charges.gstPercent || 0);
    const gstAmount = (totalCharges * gstPercent) / 100;

    const grandTotal =
      totalCharges +
      gstAmount -
      Number(charges.advance || 0);

    /* ================= GOODS TABLE ================= */
    let currentY = 200;

    gr.items.forEach((item) => {
      doc.font("Helvetica").fontSize(9);
      doc.text(item.packages || "-", 45, currentY);
      doc.text(item.itemName || "-", 100, currentY);
      doc.text(`Rs.${Number(item.amount || 0).toFixed(2)}`, 480, currentY);
      currentY += 18;
    });

    /* ================= CHARGES TABLE ================= */
    const chargesY = currentY + 20;

    const allCharges = [
      ["Labour", charges.labour || 0],
      ["Cartage", charges.cartage || 0],
      ["Door Delivery", charges.doorDelivery || 0],
      ["Insurance", charges.insurance || 0],
      ["Other", charges.other || 0],
      ["Freight", charges.freight || 0],
      ["Lorry Freight", charges.lorryFreight || 0],
      ["Transporter Charge", charges.transporterCharge || 0],
      ["GST Percent", gstPercent],
      ["GST", gstAmount],
      ["Advance", charges.advance || 0],
    ];

    let y = chargesY;
    allCharges.forEach(([label, value]) => {
      doc.text(label, 45, y);

      if (label === "GST Percent") {
        doc.text(`${value}%`, 450, y);
      } else {
        doc.text(`Rs.${Number(value).toFixed(2)}`, 450, y);
      }

      y += 18;
    });

    /* ================= GRAND TOTAL ================= */
    const grandTotalY = y + 10;

    doc.rect(40, grandTotalY, 510, 25)
      .fill("#FFF8E1")
      .stroke("#FF9800");

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#E65100");
    doc.text("GRAND TOTAL", 45, grandTotalY + 8);
    doc.text(`Rs.${grandTotal.toFixed(2)}`, 400, grandTotalY + 8);

    /* ================= AMOUNT IN WORDS ================= */
    const numberToWords = (num) => {
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
        "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
        "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"];

      const convert = (n) => {
        if (n < 20) return ones[n];
        if (n < 100)
          return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000)
          return ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 ? " " + convert(n % 100) : "");
        if (n < 100000)
          return convert(Math.floor(n / 1000)) +
            " Thousand " +
            convert(n % 1000);
        if (n < 10000000)
          return convert(Math.floor(n / 100000)) +
            " Lakh " +
            convert(n % 100000);
        return convert(Math.floor(n / 10000000)) +
          " Crore " +
          convert(n % 10000000);
      };

      const rupees = Math.floor(num);
      const paise = Math.round((num - rupees) * 100);

      let words = convert(rupees).trim() + " Rupees";

      if (paise > 0) {
        words += " " + convert(paise) + " Paise";
      }

      return words + " Only";
    };

    const amountWords = numberToWords(grandTotal);

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#2E3A59");
    doc.text("Amount in Words:", 45, grandTotalY + 40);

    doc.font("Helvetica").fontSize(9).fillColor("black");
    doc.text(amountWords, 160, grandTotalY + 40);

    doc.end();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};