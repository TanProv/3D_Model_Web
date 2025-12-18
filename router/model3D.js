    import express from "express";
import {
    uploadModel,
    getAllModels,
    getModelById,
    updateModel,
    deleteModel,
    searchModels,
    uploadModelFiles
} from "../controllers/model3DController.js";

const router = express.Router();

router.post("/upload", uploadModelFiles, uploadModel);
router.get("/", getAllModels);
router.get("/search", searchModels);
router.get("/:id", getModelById);
router.put("/:id", uploadModelFiles, updateModel);
router.delete("/:id", deleteModel);

export default router;