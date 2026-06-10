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

/* ================= COMPACT LR HEADER ================= */

// Top Information Row

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#555555")
  .text(
    `GSTIN/UIN: ${organization?.gstin || "-"}`,
    40,
    8,
    {
      width: 170,
      align: "left",
    }
  );

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#555555")
  .text(
    "Subject to Surat Jurisdiction",
    170,
    8,
    {
      width: 250,
      align: "center",
    }
  );

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#555555")
  .text(
    `Contact: ${organization?.contactNumber || "-"}`,
    420,
    8,
    {
      width: 130,
      align: "right",
    }
  );

// Company Name
doc
  .font("Times-Bold")
  .fontSize(25)
  .fillColor("#2E3A59")
  .text(
    organization?.companyName || "PARTNER TRANSPORT SERVICES",
    40,
    22,
    {
      align: "center",
      width: 510,
    }
  );

// Organization Address
// Organization Address
const organizationAddress = organization?.address || "-";

doc
  .font("Helvetica")
  .fontSize(8)
  .fillColor("black")
  .text(
    organizationAddress,
    75,
    42,
    {
      width: 440,
      align: "center",
    }
  );

// Exact ending position after address rendering
const headerEndY = doc.y + 4;


/* ================= LR META INFORMATION ================= */

// Date formatter (dd/mm/yyyy)
const formatDate = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Start immediately below compact header
const lrMetaY = headerEndY + 4;

// Date (Left)
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor("black")
  .text(`Date: ${formatDate(gr.grDate)}`, 40, lrMetaY, {
    width: 180,
    align: "left",
  });

// LR Number (Right - highlighted but compact)
doc
  .font("Helvetica-Bold")
  .fontSize(14)
  .fillColor("#D32F2F")
  .text(`L.R No.: ${gr.grNo}`, 330, lrMetaY - 2, {
    width: 220,
    align: "right",
  });

// Compact separator line
const separatorY = lrMetaY + 18;

doc
  .strokeColor("#2E3A59")
  .lineWidth(1)
  .moveTo(40, separatorY)
  .lineTo(550, separatorY)
  .stroke();


/* ================= COMPACT DELIVERY & PAYMENT INFORMATION ================= */

// Start below LR meta section
const deliveryPaymentY = separatorY + 6;

// Delivery Type
doc
  .font("Helvetica-Bold")
  .fontSize(8)
  .fillColor("#2E3A59")
  .text("Delivery:", 40, deliveryPaymentY);

doc
  .font("Helvetica")
  .fontSize(8)
  .fillColor("black")
  .text(gr.deliveryType || "Godown", 85, deliveryPaymentY, {
    width: 80,
  });

// Payment Mode
doc
  .font("Helvetica-Bold")
  .fontSize(8)
  .fillColor("#2E3A59")
  .text("Payment:", 180, deliveryPaymentY);

doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor("black")
  .text(gr.paymentMode || "To Pay", 235, deliveryPaymentY, {
    width: 80,
    underline: true,
  });

// Payment Received (only for Paid mode)
if (gr.paymentMode === "Paid" && gr.paymentReceived) {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#2E3A59")
    .text("Received:", 330, deliveryPaymentY);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("black")
    .text(
      `Rs.${Number(gr.paymentReceived || 0).toFixed(2)}`,
      385,
      deliveryPaymentY,
      {
        width: 120,
      }
    );
}

// Dynamic end position for next section
const deliveryPaymentEndY = deliveryPaymentY + 14;


/* ================= PARTY INFORMATION SECTION ================= */

// Start below delivery/payment row
const sectionY = deliveryPaymentEndY + 6;

/* ===== DYNAMIC HEIGHT CALCULATION ===== */

const consignorText = gr.consignor || "-";
const consigneeText = gr.consignee || "-";

// Calculate actual text heights
const consignorTextHeight = doc.heightOfString(consignorText, {
  width: 155,
  lineGap: 1,
});

const consigneeTextHeight = doc.heightOfString(consigneeText, {
  width: 155,
  lineGap: 1,
});

// Minimum height keeps layout clean for short addresses
const detailsHeight = Math.max(
  45,
  consignorTextHeight + 10,
  consigneeTextHeight + 10
);

/* ===== CONSIGNOR ===== */

// Header
doc.rect(40, sectionY, 165, 14).fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59")
  .text("CONSIGNOR", 45, sectionY + 3);

// Details Box
doc.rect(40, sectionY + 14, 165, detailsHeight).stroke("#CCCCCC");

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("black")
  .text(consignorText, 44, sectionY + 18, {
    width: 157,
    align: "left",
    lineGap: 1,
  });

/* ===== CONSIGNEE ===== */

// Header
doc.rect(220, sectionY, 165, 14).fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59")
  .text("CONSIGNEE", 225, sectionY + 3);

// Details Box
doc.rect(220, sectionY + 14, 165, detailsHeight).stroke("#CCCCCC");

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("black")
  .text(consigneeText, 224, sectionY + 18, {
    width: 157,
    align: "left",
    lineGap: 1,
  });


/* ===== TRANSPORT INFORMATION ===== */

// Transport Header
doc.rect(400, sectionY, 150, 14).fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59")
  .text("TRANSPORT", 440, sectionY + 3);

// Transport Box
doc.rect(400, sectionY + 14, 150, detailsHeight).stroke("#CCCCCC");

// Compact transport details
const transportDetails = [
  `From : ${gr.fromCity || "-"}`,
  `To : ${gr.toCity || "-"}`,
  `Vehicle : ${gr.vehicleNo || "-"}`,
];

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("black")
  .text(transportDetails.join("\n"), 405, sectionY + 18, {
    width: 140,
    lineGap: 2,
  });

/* ================= PARTY SECTION END ================= */

// Dynamic ending position used by Goods Table
const partySectionEndY = sectionY + 14 + detailsHeight;

/* ================= GOODS INFORMATION TABLE ================= */

// Start below dynamic party section
const goodsTableY = partySectionEndY + 8;

/* ===== TABLE HEADER ===== */

doc
  .rect(40, goodsTableY, 510, 14)
  .fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59");

doc.text("Pkgs", 45, goodsTableY + 3);
doc.text("Description", 95, goodsTableY + 3);
doc.text("Pack", 235, goodsTableY + 3);
doc.text("Act.Wt", 290, goodsTableY + 3);
doc.text("Chg.Wt", 345, goodsTableY + 3);
doc.text("Rate", 410, goodsTableY + 3);
doc.text("Amount", 470, goodsTableY + 3);

/* ===== ITEM ROWS ===== */

let currentY = goodsTableY + 14;

gr.items.forEach((item) => {
  const description = item.itemName || "-";

  // Dynamic row height based on description
  const descriptionHeight = doc.heightOfString(description, {
    width: 130,
  });

  const rowHeight = Math.max(14, descriptionHeight + 4);

  // Row border
  doc.rect(40, currentY, 510, rowHeight).stroke("#CCCCCC");

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("black");

  doc.text(item.packages || "-", 45, currentY + 2, {
    width: 40,
  });

  doc.text(description, 95, currentY + 2, {
    width: 130,
    align: "left",
  });

  doc.text(item.packing || "-", 235, currentY + 2, {
    width: 45,
  });

  doc.text(
    Number(item.actualWeight || 0).toFixed(2),
    290,
    currentY + 2,
    {
      width: 45,
    }
  );

  doc.text(
    Number(item.chargeableWeight || 0).toFixed(2),
    345,
    currentY + 2,
    {
      width: 55,
    }
  );

  doc.text(
    Number(item.rate || 0).toFixed(2),
    410,
    currentY + 2,
    {
      width: 50,
    }
  );

  doc.text(
    Number(item.amount || 0).toFixed(2),
    470,
    currentY + 2,
    {
      width: 75,
      align: "left",
    }
  );

  currentY += rowHeight;
});

/* ================= GOODS TABLE END ================= */

// Used by Charges section
const goodsTableEndY = currentY;

/* ================= CHARGES & TOTAL SECTION ================= */

// Start below dynamic goods table
const chargesY = goodsTableEndY + 6;

/* ===== CHARGE CALCULATIONS ===== */

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

const subtotalBeforeGST =
  labour +
  cartage +
  doorDelivery +
  insurance +
  other +
  freight +
  lorryFreight +
  transporterCharge;

const calculatedGSTAmount =
  (subtotalBeforeGST * gstPercent) / 100;

const calculatedGrandTotal =
  subtotalBeforeGST +
  calculatedGSTAmount -
  advance;

gr.charges.gstAmount = calculatedGSTAmount;
gr.charges.grandTotal = calculatedGrandTotal;

/* ===== LEFT CHARGES ===== */

const leftChargesWidth = 245;

doc
  .rect(40, chargesY, leftChargesWidth, 14)
  .fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59");

doc.text("CHARGES", 45, chargesY + 3);
doc.text("AMOUNT", 190, chargesY + 3);

const leftCharges = [
  ["Labour", labour],
  ["Cartage", cartage],
  ["Door Delivery", doorDelivery],
  ["Insurance", insurance],
  ["Other", other],
];

let leftRowY = chargesY + 14;

leftCharges.forEach(([label, value]) => {
  doc.rect(40, leftRowY, leftChargesWidth, 12).stroke("#CCCCCC");

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("black");

  doc.text(label, 45, leftRowY + 2);

  doc.text(
    value.toFixed(2),
    190,
    leftRowY + 2
  );

  leftRowY += 12;
});

/* ===== RIGHT CHARGES ===== */

const rightChargesWidth = 245;

doc
  .rect(305, chargesY, rightChargesWidth, 14)
  .fillAndStroke("#F0F0F0", "#2E3A59");

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59");

doc.text("CHARGES", 310, chargesY + 3);
doc.text("AMOUNT", 450, chargesY + 3);

const rightCharges = [
  ["Freight", freight],
  ["Lorry Freight", lorryFreight],
  ["Transporter Charge", transporterCharge],
  ["GST %", gstPercent],
  ["GST", calculatedGSTAmount],
  ["Advance", advance],
];

let rightRowY = chargesY + 14;

rightCharges.forEach(([label, value]) => {
  doc.rect(305, rightRowY, rightChargesWidth, 12).stroke("#CCCCCC");

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("black");

  doc.text(label, 310, rightRowY + 2);

  if (label === "GST %") {
    doc.text(
      `${value.toFixed(2)}%`,
      450,
      rightRowY + 2
    );
  } else {
    doc.text(
      value.toFixed(2),
      450,
      rightRowY + 2
    );
  }

  rightRowY += 12;
});

/* ===== CHARGES SECTION END ===== */

const chargesTableEndY =
  Math.max(leftRowY, rightRowY);

/* ================= TOTAL SUMMARY ================= */

// Start below compact charges tables
const subtotalY = chargesTableEndY + 4;

/* ===== SUBTOTAL ===== */

doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#555555")
  .text(
    `Subtotal: Rs.${subtotalBeforeGST.toFixed(2)}`,
    40,
    subtotalY
  );

/* ===== GRAND TOTAL ===== */

const grandTotalY = subtotalY + 10;

// Compact highlighted total box
doc
  .rect(40, grandTotalY, 510, 18)
  .fillAndStroke("#FFF8E1", "#FF9800");

doc
  .font("Helvetica-Bold")
  .fontSize(9)
  .fillColor("#E65100");

doc.text(
  "GRAND TOTAL",
  45,
  grandTotalY + 5
);

doc.text(
  `Rs.${calculatedGrandTotal.toFixed(2)}`,
  420,
  grandTotalY + 5,
  {
    width: 120,
    align: "right",
  }
);

/* ===== TOTAL SECTION END ===== */

const totalSectionEndY = grandTotalY + 18;

/* ================= NUMBER TO WORDS HELPER ================= */

const numberToWords = (num) => {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero Rupees Only";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];

    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] +
        (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    }

    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0
        ? " and " + convertLessThanThousand(n % 100)
        : "")
    );
  };

  let integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = "";

  if (integerPart >= 10000000) {
    result +=
      convertLessThanThousand(
        Math.floor(integerPart / 10000000)
      ) + " Crore ";
    integerPart %= 10000000;
  }

  if (integerPart >= 100000) {
    result +=
      convertLessThanThousand(
        Math.floor(integerPart / 100000)
      ) + " Lakh ";
    integerPart %= 100000;
  }

  if (integerPart >= 1000) {
    result +=
      convertLessThanThousand(
        Math.floor(integerPart / 1000)
      ) + " Thousand ";
    integerPart %= 1000;
  }

  if (integerPart > 0) {
    result += convertLessThanThousand(integerPart);
  }

  result = result.trim();

  if (decimalPart > 0) {
    result +=
      " Rupees " +
      convertLessThanThousand(decimalPart) +
      " Paise Only";
  } else {
    result += " Rupees Only";
  }

  return result;
};

/* ================= AMOUNT IN WORDS ================= */

// Start below total section
const amountInWordsY = totalSectionEndY + 4;

const grandTotalInWords = numberToWords(
  calculatedGrandTotal
);

// Calculate actual height required
const wordsHeight = doc.heightOfString(grandTotalInWords, {
  width: 420,
});

// Label
doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .fillColor("#2E3A59")
  .text("In Words:", 45, amountInWordsY);

// Amount text
doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("black")
  .text(grandTotalInWords, 95, amountInWordsY, {
    width: 450,
    align: "left",
  });

/* ================= WORDS SECTION END ================= */

const wordsSectionEndY =
  amountInWordsY + Math.max(wordsHeight, 10);

   /* ================= COMPACT LR FOOTER ================= */

// Start below dynamic words section
const footerY = wordsSectionEndY + 4;

// First footer row
doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#555555");

doc.text(
  `Bill No: ${gr.billNumber || "-"}`,
  45,
  footerY
);

doc.text(
  `E-Way: ${gr.ewayBill || "-"}`,
  310,
  footerY,
  {
    width: 230,
    align: "right",
  }
);

// Second footer row
doc.text(
  `Payment: ${gr.billPayment || "-"}`,
  45,
  footerY + 10
);

// Compact disclaimer
doc
  .font("Helvetica")
  .fontSize(6)
  .fillColor("#666666")
  .text(
    "Company not responsible for leakage, breakage or damage.",
    45,
    footerY + 20,
    {
      width: 500,
      align: "center",
    }
  );

// Final separator line
const footerLineY = footerY + 32;

doc
  .strokeColor("#2E3A59")
  .lineWidth(0.8)
  .moveTo(40, footerLineY)
  .lineTo(550, footerLineY)
  .stroke();

/* ================= PDF END ================= */

doc.end();

} catch (err) {
  console.error("PDF Error", err);

  if (!res.headersSent) {
    res.status(500).json({
      message: "Failed to generate PDF",
    });
  }
}
};