import express from "express";
import model3DRoutes from "./model3d.js";

const router = express.Router();

router.use("/models", model3DRoutes);

export default router;