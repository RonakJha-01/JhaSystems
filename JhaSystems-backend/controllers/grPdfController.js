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
    // Transporter Details (Center)
    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor("#2E3A59")
      .text(organization?.companyName || "PARTNER TRANSPORT SERVICES", 150, 25, {
        align: "center",
        width: 250
      });

doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor("black");


const address = organization?.address || "";
const contactGstinText = `Contact: ${organization?.contactNumber || "-"} | GSTIN: ${organization?.gstin || "-"}`;


const addressLines = [];
const maxCharsPerLine = 35; 


let remainingAddress = address;
while (remainingAddress.length > maxCharsPerLine) {
  let lastSpace = remainingAddress.lastIndexOf(' ', maxCharsPerLine);
  if (lastSpace === -1) lastSpace = maxCharsPerLine;
  addressLines.push(remainingAddress.substring(0, lastSpace));
  remainingAddress = remainingAddress.substring(lastSpace + 1);
}
if (remainingAddress) {
  addressLines.push(remainingAddress);
}


const finalAddressLines = addressLines.length > 0 ? addressLines : [address];


const addressStartY = 45;
const lineHeight = 12;


finalAddressLines.forEach((line, index) => {
  doc.text(line, 150, addressStartY + (index * lineHeight), {
    align: "center",
    width: 250
  });
});


const contactGstinY = addressStartY + (finalAddressLines.length * lineHeight) + 5;

doc
  .font("Helvetica")
  .fontSize(10)
  .text(contactGstinText, 150, contactGstinY, {
    align: "center",
    width: 250
  });

// Date on Left side - Format as dd/mm/yyyy with proper month
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month in between (01-12)
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

doc
  .font("Helvetica")
  .fontSize(12)
  .text(`Date: ${formatDate(gr.grDate)}`, 40, 80, { 
    align: "left", 
    width: 200 
  });

    // GR Number on Right side (Prominent)
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#D32F2F")
      .text(`L.R No. : ${gr.grNo}`, 40, 70, { align: "right", width: 510 });
    
    // Separator line
    doc.moveTo(40, 95).lineTo(550, 95).stroke("#2E3A59");


    /* ================= DELIVERY TYPE & PAYMENT MODE SECTION ================= */
    const deliveryPaymentY = 100;
    
    // Delivery Type (Top left of the section)
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#2E3A59")
      .text("Delivery Type:", 40, deliveryPaymentY);
    
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("black")
      .text(gr.deliveryType || "Godown", 110, deliveryPaymentY);
    
    // Payment Mode (Next to Delivery Type)
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#2E3A59")
      .text("Payment Mode:", 200, deliveryPaymentY);
    
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("black")
      .text(gr.paymentMode || "To Pay", 280, deliveryPaymentY);
    
    // Payment Received (if Paid mode)
    if (gr.paymentMode === "Paid" && gr.paymentReceived) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#2E3A59")
        .text("Payment Received:", 360, deliveryPaymentY);
      
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("black")
        .text(`Rs.${Number(gr.paymentReceived || 0).toFixed(2)}`, 450, deliveryPaymentY);
    }

    /* ================= SEPARATE TABLES SECTION ================= */
    const sectionY = 120;

    /* ===== CONSIGNOR TABLE (LEFT) ===== */
    // Consignor Header
    doc.rect(40, sectionY, 165, 18).fillAndStroke("#F0F0F0", "#2E3A59");
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#2E3A59")
      .text("CONSIGNOR NAME & ADDRESS:", 45, sectionY + 5, {
        align: "left",
        width: 155,
      });

    // Consignor Details (multi-line support)
    doc.rect(40, sectionY + 18, 165, 60).stroke("#CCCCCC");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text(gr.consignor || "-", 45, sectionY + 22, {
        width: 155,
        align: "left",
        lineGap: 2,
      });


    /* ===== CONSIGNEE TABLE (MIDDLE) ===== */
    // Consignee Header
    doc.rect(220, sectionY, 165, 18).fillAndStroke("#F0F0F0", "#2E3A59");
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#2E3A59")
      .text("CONSIGNEE NAME & ADDRESS:", 225, sectionY + 5, {
        align: "left",
        width: 155,
      });

    // Consignee Details (multi-line support)
    doc.rect(220, sectionY + 18, 165, 60).stroke("#CCCCCC");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text(gr.consignee || "-", 225, sectionY + 22, {
        width: 155,
        align: "left",
        lineGap: 2,
      });


    /* ===== TRANSPORT DETAILS TABLE (RIGHT) ===== */
    // Transport Header
    doc.rect(400, sectionY, 150, 18).fillAndStroke("#F0F0F0", "#2E3A59");
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#2E3A59")
      .text("TRANSPORT DETAILS", 425, sectionY + 5, {
        width: 100,
      });

    // Transport Details (fixed size box)
      doc.rect(400, sectionY + 18, 150, 60).stroke("#CCCCCC");
      
      const transportDetails = [
        `From: ${gr.fromCity || "-"}`,
        `To: ${gr.toCity || "-"}`,
        `Vehicle: ${gr.vehicleNo || "-"}`,
      ].filter(Boolean);
      
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("black")
        .text(transportDetails.join("\n"), 405, sectionY + 25, {
          width: 140,   // keeps text inside the box
          lineGap: 3,   // spacing between lines
        });


/* ================= GOODS TABLE ================= */
const goodsTableY = sectionY + 95;
doc.rect(40, goodsTableY, 510, 18).fillAndStroke("#F0F0F0", "#2E3A59");

doc.font("Helvetica-Bold").fontSize(9).fillColor("#2E3A59");
doc.text("Pkgs", 45, goodsTableY + 4);
doc.text("Description", 100, goodsTableY + 4);
doc.text("Packing", 230, goodsTableY + 4);
doc.text("Act.Wt", 300, goodsTableY + 4);
doc.text("Chg.Wt", 360, goodsTableY + 4);
doc.text("Rate", 420, goodsTableY + 4);
doc.text("Amount", 480, goodsTableY + 4);

let currentY = goodsTableY + 18;
gr.items.forEach((item) => {
  doc.rect(40, currentY, 510, 18).stroke("#CCCCCC");
  doc.font("Helvetica").fontSize(9).fillColor("black");
  doc.text(item.packages || "-", 45, currentY + 4);
  doc.text(item.itemName || "-", 100, currentY + 4, { width: 120 });
  doc.text(item.packing || "-", 230, currentY + 4, { width: 60 });
  doc.text(Number(item.actualWeight || 0).toFixed(2), 300, currentY + 4);
  doc.text(
    Number(item.chargeableWeight || 0).toFixed(2),
    360,
    currentY + 4
  );
  doc.text(`Rs.${Number(item.rate || 0).toFixed(2)}`, 420, currentY + 4);
  doc.text(`Rs.${Number(item.amount || 0).toFixed(2)}`, 480, currentY + 4);
  currentY += 18;
});

/* ================= SPLIT CHARGES TABLE ================= */
const chargesY = currentY + 10;

// Calculate GRAND TOTAL correctly (excluding item amounts)
// Get values from gr.charges object
const labour = Number(gr.charges.labour || 0);
const cartage = Number(gr.charges.cartage || 0);
const doorDelivery = Number(gr.charges.doorDelivery || 0);
const insurance = Number(gr.charges.insurance || 0);
const other = Number(gr.charges.other || 0);
const freight = Number(gr.charges.freight || 0);
const lorryFreight = Number(gr.charges.lorryFreight || 0);
const transporterCharge = Number(gr.charges.transporterCharge || 0);
const gstPercent = Number(gr.charges.gstPercent || 0);
const advance = Number(gr.charges.advance || 0);

// Calculate subtotal BEFORE GST (only the chargeable services)
const subtotalBeforeGST = labour + cartage + doorDelivery + insurance + other + freight + lorryFreight + transporterCharge;

// Calculate GST amount correctly
const calculatedGSTAmount = (subtotalBeforeGST * gstPercent) / 100;

// Calculate Grand Total (subtotal + GST - Advance)
const calculatedGrandTotal = subtotalBeforeGST + calculatedGSTAmount - advance;

// Update the gr.charges object with calculated values
gr.charges.gstAmount = calculatedGSTAmount;
gr.charges.grandTotal = calculatedGrandTotal;

// Left Charges Table
const leftChargesY = chargesY;
const leftChargesWidth = 245;

// Left Header
doc.rect(40, leftChargesY, leftChargesWidth, 18).fillAndStroke("#F0F0F0", "#2E3A59");
doc.font("Helvetica-Bold").fontSize(9).fillColor("#2E3A59");
doc.text("Charges", 45, leftChargesY + 4);
doc.text("Amount (Rs.)", 180, leftChargesY + 4);

// Left Charges
const leftCharges = [
  ["Labour", labour],
  ["Cartage", cartage],
  ["Door Delivery", doorDelivery],
  ["Insurance", insurance],
  ["Other", other],
];

let leftRowY = leftChargesY + 18;
leftCharges.forEach(([label, value]) => {
  doc.rect(40, leftRowY, leftChargesWidth, 18).stroke("#CCCCCC");
  doc.font("Helvetica").fontSize(9).fillColor("black");
  doc.text(label, 45, leftRowY + 4);
  doc.text(`Rs.${value.toFixed(2)}`, 180, leftRowY + 4);
  leftRowY += 18;
});

// Right Charges Table
const rightChargesY = chargesY;
const rightChargesWidth = 245;

// Right Header
doc.rect(305, rightChargesY, rightChargesWidth, 18).fillAndStroke("#F0F0F0", "#2E3A59");
doc.font("Helvetica-Bold").fontSize(9).fillColor("#2E3A59");
doc.text("Charges", 310, rightChargesY + 4);
doc.text("Amount (Rs.)", 445, rightChargesY + 4);

// Right Charges
const rightCharges = [
  ["Freight", freight],
  ["Lorry Freight", lorryFreight],
  ["Transporter Charge", transporterCharge],
  ["GST Percent", gstPercent],
  ["GST", calculatedGSTAmount],
  ["Advance", advance],
];

let rightRowY = rightChargesY + 18;
rightCharges.forEach(([label, value]) => {
  doc.rect(305, rightRowY, rightChargesWidth, 18).stroke("#CCCCCC");
  doc.font("Helvetica").fontSize(9).fillColor("black");
  doc.text(label, 310, rightRowY + 4);
  if (label === "GST Percent") {
    doc.text(`${value.toFixed(2)}%`, 445, rightRowY + 4);
  } else if (label === "Advance") {
    doc.text(`Rs.${value.toFixed(2)}`, 445, rightRowY + 4);
  } else {
    doc.text(`Rs.${value.toFixed(2)}`, 445, rightRowY + 4);
  }
  rightRowY += 18;
});

/* ================= SUBTOTAL DISPLAY (Optional - for clarity) ================= */
const subtotalY = Math.max(leftRowY, rightRowY) + 5;
doc.font("Helvetica-Bold").fontSize(9).fillColor("#555555");
doc.text(`Subtotal (before GST): Rs.${subtotalBeforeGST.toFixed(2)}`, 40, subtotalY);

/* ================= GRAND TOTAL - SPANNING BOTH COLUMNS ================= */
const grandTotalY = subtotalY + 15;

// Background highlight for grand total (spans full width)
doc.rect(40, grandTotalY, 510, 25).fill("#FFF8E1").stroke("#FF9800");

doc.font("Helvetica-Bold").fontSize(11).fillColor("#E65100");
doc.text("GRAND TOTAL", 45, grandTotalY + 8);
doc.text(
  `Rs.${calculatedGrandTotal.toFixed(2)}`,
  400,
  grandTotalY + 8
);

/* ================= GRAND TOTAL IN WORDS ================= */
const amountInWordsY = grandTotalY + 30;
    
    // Function to convert number to words
const numberToWords = (num) => {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero Rupees Only";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertLessThanThousand(n % 100) : "")
    );
  };

  let integerPart = Math.floor(num);
  // Round to 2 decimal places to avoid floating point issues
  const decimalPart = Math.round((num - integerPart) * 100);
  let result = "";

  if (integerPart >= 10000000) {
    result += convertLessThanThousand(Math.floor(integerPart / 10000000)) + " Crore ";
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    result += convertLessThanThousand(Math.floor(integerPart / 100000)) + " Lakh ";
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    result += convertLessThanThousand(Math.floor(integerPart / 1000)) + " Thousand ";
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    result += convertLessThanThousand(integerPart);
  }

  result = result.trim();

  // ✅ FIX: Show paise as words, not fraction
  if (decimalPart > 0) {
    result += " Rupees " + convertLessThanThousand(decimalPart) + " Paise Only";
  } else {
    result += " Rupees Only";
  }

  return result;
};

    const grandTotalInWords = numberToWords(gr.charges.grandTotal || 0);
    
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#2E3A59");
    doc.text("Amount in Words:", 45, amountInWordsY);
    doc.font("Helvetica").fontSize(9).fillColor("black");
    doc.text(grandTotalInWords, 120, amountInWordsY, { width: 400 });

    /* ================= FOOTER ================= */
    const footerY = amountInWordsY + 30;
    doc.font("Helvetica").fontSize(8).fillColor("#555555");
    doc.text(`Bill No: ${gr.billNumber || "-"}`, 45, footerY);
    doc.text(`E-Way Bill: ${gr.ewayBill || "-"}`, 400, footerY);
    doc.text(`Bill Payment: ${gr.billPayment || "-"}`, 45, footerY + 12); // Added Bill Payment in footer too

    doc.text(
      "Disclaimer: Company not responsible for leakage, breakage or damage.",
      45,
      footerY + 30
    );

    // Bottom separator
    doc.moveTo(40, footerY + 50).lineTo(550, footerY + 50).stroke("#2E3A59");

    doc.end();
  } catch (err) {
    console.error("PDF Error", err);
    // Don't try to send response if it's already ended
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};