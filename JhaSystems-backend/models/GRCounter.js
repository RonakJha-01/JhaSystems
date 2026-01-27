import mongoose from "mongoose";

const grCounterSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
    },

    lastGRNo: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GRCounter", grCounterSchema);