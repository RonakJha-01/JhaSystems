import express from "express";
import { createGR, getGRs } from "../controllers/grController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create GR
router.post("/", authMiddleware, createGR);

// Get ALL GRs (Dashboard list)
router.get("/all", authMiddleware, getGRs);

export default router;
