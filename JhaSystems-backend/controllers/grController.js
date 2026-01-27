import GR from "../models/GR.js";
import GRCounter from "../models/GRCounter.js";

export const createGR = async (req, res) => {
  try {
    const {
      fromCity,
      toCity,
      consignor,
      consignee,
      items,
      vehicleNo,
      deliveryType,
      billNumber,
      ewayBill,
      billPayment,
      paymentMode,
      paymentReceived,
      charges,
      grDate,
      manualGrNo,
    } = req.body;

    console.log("Received data:", JSON.stringify(req.body, null, 2));
    console.log("Items received:", items);

    // 🔴 BASIC VALIDATION (PREVENT 500)
    if (!fromCity || !toCity || !consignor || !consignee) {
      return res.status(400).json({
        message: "Required fields missing: fromCity, toCity, consignor, consignee",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName || item.itemName.trim() === "") {
        return res.status(400).json({
          message: `Item ${i + 1}: Item name is required`,
        });
      }
      if (!item.chargeableWeight || isNaN(item.chargeableWeight)) {
        return res.status(400).json({
          message: `Item ${i + 1}: Valid chargeable weight is required`,
        });
      }
      if (!item.rate || isNaN(item.rate)) {
        return res.status(400).json({
          message: `Item ${i + 1}: Valid rate is required`,
        });
      }
    }

    // 🔐 AUTH DATA
    const organizationId = req.user.organizationId;
    const createdBy = req.user._id;

    /* ======================
       ✅ FIXED GR NUMBER LOGIC
       (PER ORGANIZATION + ATOMIC)
    ======================= */
    let grNo;

    if (manualGrNo && !isNaN(manualGrNo)) {
      grNo = parseInt(manualGrNo);

      const existingGR = await GR.findOne({
        organizationId,
        $or: [{ grNo }, { manualGrNo: grNo }],
        isDeleted: false,
      });

      if (existingGR) {
        return res.status(400).json({
          message: `GR number ${grNo} already exists for this organization`,
        });
      }

      await GRCounter.findOneAndUpdate(
        { organizationId },
        { $max: { lastGRNo: grNo } },
        { upsert: true }
      );
    } else {
      const counter = await GRCounter.findOneAndUpdate(
        { organizationId },
        { $inc: { lastGRNo: 1 } },
        { new: true, upsert: true }
      );

      grNo = counter.lastGRNo;
    }

    /* ======================
       CREATE GR DOCUMENT
    ======================= */
    let formattedDate = new Date();
    if (grDate) {
      if (typeof grDate === "string" && grDate.includes("/")) {
        const [day, month, year] = grDate.split("/");
        formattedDate = new Date(`${year}-${month}-${day}`);
      } else {
        formattedDate = new Date(grDate);
      }
      if (isNaN(formattedDate.getTime())) formattedDate = new Date();
    }

    const preparedItems = items.map((i) => ({
      itemName: i.itemName.trim(),
      packing: i.packing ? i.packing.trim() : "",
      packages: i.packages ? Number(i.packages) : 0,
      actualWeight: i.actualWeight ? Number(i.actualWeight) : 0,
      chargeableWeight: Number(i.chargeableWeight || 0),
      rate: Number(i.rate || 0),
      amount: Number(i.amount || 0),
    }));

    const preparedCharges = {
      labour: Number(charges?.labour || 0),
      cartage: Number(charges?.cartage || 0),
      doorDelivery: Number(charges?.doorDelivery || 0),
      insurance: Number(charges?.insurance || 0),
      other: Number(charges?.other || 0),
      freight: Number(charges?.freight || 0),
      advance: Number(charges?.advance || 0),
      lorryFreight: Number(charges?.lorryFreight || 0),
      transporterCharge: Number(charges?.transporterCharge || 0),
      gstPercent: Number(charges?.gstPercent || 0),
      gstAmount: Number(charges?.gstAmount || 0),
      grandTotal: Number(charges?.grandTotal || 0),
    };

    const gr = await GR.create({
      organizationId,
      createdBy,
      grNo,
      manualGrNo: manualGrNo ? parseInt(manualGrNo) : undefined,
      grDate: formattedDate,

      fromCity: fromCity.trim(),
      toCity: toCity.trim(),
      consignor: consignor.trim(),
      consignee: consignee.trim(),

      billNumber: billNumber ? billNumber.trim() : "",
      ewayBill: ewayBill ? ewayBill.trim() : "",
      billPayment: billPayment ? billPayment.trim() : "",

      items: preparedItems,
      vehicleNo: vehicleNo ? vehicleNo.trim() : "",
      deliveryType: deliveryType || "Godown",

      paymentMode: paymentMode || "To Pay",
      paymentReceived: paymentReceived ? Number(paymentReceived) : 0,

      charges: preparedCharges,
    });

    res.status(201).json({
      message: "GR created successfully",
      gr,
    });
  } catch (error) {
    console.error("Create GR Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGRs = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const grs = await GR.findByOrganization(organizationId);
    res.json(grs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getGRById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const gr = await GR.findOne({ _id: id, organizationId, isDeleted: false });
    if (!gr) return res.status(404).json({ message: "GR not found" });

    res.json(gr);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
