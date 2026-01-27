import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    activeSessionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
