import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import grRoutes from "./routes/grRoutes.js";
import grPdfRoutes from "./routes/grPdfRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [          // Local Vite Development
  "https://jha-systems-bills.vercel.app",    // Your Vercel Preview URL
 // "https://jhasystems.com",          // Your Final Dynadot Domain
  //"https://www.jhasystems.com"       // Include www version
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// ----------------------------------

app.use(express.json());

// Routes
app.use("/api/gr", grRoutes);
app.use("/api/gr", grPdfRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);

// Port configuration for Render
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Jha Systems Backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});