import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    packing: { type: String },
    packages: { type: Number },
    actualWeight: { type: Number },
    chargeableWeight: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const grSchema = new mongoose.Schema(
  {
    /* =====================
       ORGANIZATION & USER
    ====================== */
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =====================
       GR NUMBERS
    ====================== */
    grNo: {
      type: Number,
      required: true,
    },

    manualGrNo: {
      type: Number,
      sparse: true,
    },

    /* =====================
       ROUTE INFO
    ====================== */
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },

    /* =====================
       PARTIES
    ====================== */
    consignor: { type: String, required: true },
    consignee: { type: String, required: true },

    /* =====================
       BILLING INFORMATION
    ====================== */
    billNumber: { type: String },
    ewayBill: { type: String },
    billPayment: { type: String },

    /* =====================
       GOODS ITEMS
    ====================== */
    items: {
      type: [itemSchema],
      validate: [
        (v) => v.length > 0,
        "At least one goods item is required",
      ],
    },

    /* =====================
       TRANSPORT INFO
    ====================== */
    vehicleNo: { type: String },
    deliveryType: {
      type: String,
      enum: ["Godown", "Door", "Transit"],
      default: "Godown",
    },

    /* =====================
       PAYMENT INFO
    ====================== */
    paymentMode: {
      type: String,
      enum: ["To Pay", "Paid", "TBB", "FOC"],
      default: "To Pay",
    },

    paymentReceived: { type: Number, default: 0 },

    /* =====================
       CHARGES & TOTALS
    ====================== */
    charges: {
      freight: { type: Number, default: 0 },
      advance: { type: Number, default: 0 },
      lorryFreight: { type: Number, default: 0 },
      transporterCharge: { type: Number, default: 0 },

      labour: { type: Number, default: 0 },
      cartage: { type: Number, default: 0 },
      doorDelivery: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },

    /* =====================
       META
    ====================== */
    grDate: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["draft", "confirmed", "in_transit", "delivered", "cancelled"],
      default: "draft",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   INDEXES
====================== */
grSchema.index({ organizationId: 1, grNo: 1 }, { unique: true });
grSchema.index({ organizationId: 1, manualGrNo: 1 }, { 
  unique: true,
  sparse: true,
  partialFilterExpression: { manualGrNo: { $exists: true } }
});
grSchema.index({ fromCity: 1, toCity: 1 });
grSchema.index({ consignor: 1, consignee: 1 });
grSchema.index({ "items.itemName": 1 });
grSchema.index({ status: 1 });
grSchema.index({ billNumber: 1 });
grSchema.index({ ewayBill: 1 });

/* =====================
   PRE-SAVE MIDDLEWARE
====================== */
// Auto-calculate charges.grandTotal and charges.gstAmount
grSchema.pre("save", async function () {
  if (this.isModified("items") || this.isModified("charges")) {
    const goodsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const chargesTotal =
      (this.charges.labour || 0) +
      (this.charges.cartage || 0) +
      (this.charges.doorDelivery || 0) +
      (this.charges.insurance || 0) +
      (this.charges.other || 0) +
      (this.charges.freight || 0) +
      (this.charges.lorryFreight || 0) +
      (this.charges.transporterCharge || 0) -
      (this.charges.advance || 0);

    const gstPercent = this.charges.gstPercent || 0;
    const gstAmount = ((goodsTotal + chargesTotal) * gstPercent) / 100;

    const grandTotal = goodsTotal + chargesTotal + gstAmount;

    this.charges.gstAmount = gstAmount;
    this.charges.grandTotal = grandTotal;
  }
});

// Ensure either grNo or manualGrNo is present
grSchema.pre("save", async function () {
  if (!this.grNo && !this.manualGrNo) {
    throw new Error("Either grNo or manualGrNo must be provided");
  }
});

/* =====================
   VIRTUAL FIELDS
====================== */
grSchema.virtual("displayGrNo").get(function () {
  return this.manualGrNo || this.grNo;
});

grSchema.virtual("totalPackages").get(function () {
  return this.items.reduce((sum, item) => sum + (item.packages || 0), 0);
});

grSchema.virtual("totalActualWeight").get(function () {
  return this.items.reduce((sum, item) => sum + (item.actualWeight || 0), 0);
});

grSchema.virtual("totalChargeableWeight").get(function () {
  return this.items.reduce((sum, item) => sum + (item.chargeableWeight || 0), 0);
});

grSchema.virtual("totalGoodsAmount").get(function () {
  return this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
});

grSchema.virtual("balance").get(function () {
  return (this.charges.freight || 0) - (this.charges.advance || 0);
});

/* =====================
   INSTANCE METHODS
====================== */
grSchema.methods.markAsDelivered = function () {
  this.status = "delivered";
  return this.save();
};

grSchema.methods.cancel = function () {
  this.status = "cancelled";
  return this.save();
};

grSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

/* =====================
   STATIC METHODS
====================== */
grSchema.statics.findActive = function (conditions = {}) {
  return this.find({ ...conditions, isDeleted: false });
};

grSchema.statics.findByOrganization = function (organizationId, conditions = {}) {
  return this.find({ organizationId, ...conditions, isDeleted: false });
};

grSchema.statics.getNextGrNo = async function (organizationId) {
  const lastGR = await this.findOne(
    { organizationId, isDeleted: false },
    { grNo: 1 }
  )
    .sort({ grNo: -1 })
    .lean();

  return lastGR ? lastGR.grNo + 1 : 1;
};

/* =====================
   TOJSON TRANSFORM
====================== */
grSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.isDeleted;
    delete ret.deletedAt;
    ret.balance = (ret.charges.freight || 0) - (ret.charges.advance || 0);
    return ret;
  },
});

export default mongoose.model("GR", grSchema);
