import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import grRoutes from "./routes/grRoutes.js";
import grPdfRoutes from "./routes/grPdfRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/gr", grRoutes);
app.use("/api/gr", grPdfRoutes);



app.use("/api/auth", authRoutes);

app.use("/api/organization", organizationRoutes);


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
