import express from "express";
import Jewelry from "../models/Jewelry.js";
import Model3D from "../models/Model3D.js";

const router = express.Router();

// CREATE Jewelry
router.post("/", async (req, res) => {
  try {
    const jewelry = await Jewelry.create(req.body);
    res.status(201).json(jewelry);
  } catch (error) {
    console.error("Create jewelry error:", error);
    res.status(500).json({
      message: "Failed to create jewelry",
      error: error.message,
    });
  }
});

// GET all Jewelry with pagination and search
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = search ? {
      name: {
        [Op.like]: `%${search}%`
      }
    } : {};

    const { count, rows } = await Jewelry.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jewelry: rows,
      totalItems: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single Jewelry by ID
router.get("/:id", async (req, res) => {
  try {
    const jewelry = await Jewelry.findByPk(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: "Jewelry not found" });
    }
    res.json(jewelry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE Jewelry
router.put("/:id", async (req, res) => {
  try {
    const jewelry = await Jewelry.findByPk(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: "Jewelry not found" });
    }
    await jewelry.update(req.body);
    res.json(jewelry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Jewelry
router.delete("/:id", async (req, res) => {
  try {
    const jewelry = await Jewelry.findByPk(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: "Jewelry not found" });
    }
    await jewelry.destroy();
    res.json({ message: "Jewelry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;