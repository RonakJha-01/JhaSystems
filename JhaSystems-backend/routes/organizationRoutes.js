import express from "express";
import { updateOrganizationProfile } from "../controllers/organizationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", authMiddleware, updateOrganizationProfile);

export default router;
