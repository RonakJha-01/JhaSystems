import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    orgCode: {
      type: String,
      unique: true,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      default: "",
    },

    contactNumber: {
      type: String,
      default: "",
    },

    gstin: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
