import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

export const login = async (req, res) => {
  const { orgCode, username, password } = req.body;

  try {
    const org = await Organization.findOne({ orgCode });
    if (!org || !org.isActive)
      return res.status(401).json({ message: "Organization not active" });

    const user = await User.findOne({ username, organizationId: org._id });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const sessionId = Date.now().toString();

    user.activeSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, orgId: org._id, sessionId },
      process.env.JHA_SYSTEM_JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, orgCode, username });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
