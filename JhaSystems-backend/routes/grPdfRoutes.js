import express from "express";
import { downloadGRPdf } from "../controllers/grPdfController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/pdf", authMiddleware, downloadGRPdf);

export default router;
