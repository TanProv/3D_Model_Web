import express from "express";
import { Op } from "sequelize"; 
import Model3D from "../models/Model3D.js";

const router = express.Router();

// CREATE Model
router.post("/", async (req, res) => {
  try {
    // req.body cần chứa: name, modelPath, format, price, ...
    const model = await Model3D.create(req.body);
    res.status(201).json(model);
  } catch (error) {
    console.error("Create model error:", error);
    res.status(500).json({
      message: "Failed to create model",
      error: error.message,
    });
  }
});

// GET all Models with pagination and search
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = search ? {
      name: {
        [Op.like]: `%${search}%`
      }
    } : {};

    const { count, rows } = await Model3D.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['uploadDate', 'DESC']] 
    });

    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single Model by ID
router.get("/:id", async (req, res) => {
  try {
    // Model3D sử dụng modelID làm khóa chính
    const model = await Model3D.findByPk(req.params.id);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE Model
router.put("/:id", async (req, res) => {
  try {
    const model = await Model3D.findByPk(req.params.id);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    await model.update(req.body);
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Model
router.delete("/:id", async (req, res) => {
  try {
    const model = await Model3D.findByPk(req.params.id);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    await model.destroy();
    res.json({ message: "Model deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
