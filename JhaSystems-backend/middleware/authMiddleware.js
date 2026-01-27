import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JHA_SYSTEM_JWT_SECRET);

    // 🔑 Fetch FULL user from DB
    const user = await User.findById(decoded.userId).select(
      "_id organizationId activeSessionId"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.activeSessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Session expired" });
    }

    // ✅ Attach full user object
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;
