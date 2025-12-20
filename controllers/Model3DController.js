import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import Model3D from "../models/Model3D.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo folders nếu chưa tồn tại
const modelFolder = "data/models";
const thumbnailFolder = "data/thumbnails";

[modelFolder, thumbnailFolder].forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// Allowed file types
const allowedModelTypes = [
    "model/gltf-binary",
    "model/gltf+json",
    "application/octet-stream",
    "application/vnd.autodesk.fbx"
];

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "model") {
            cb(null, modelFolder);
        } else if (file.fieldname === "thumbnail") {
            cb(null, thumbnailFolder);
        } else {
            cb(new Error("Invalid field name"), null);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "model") {
        allowedModelTypes.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Invalid 3D model file type"), false);
    } else if (file.fieldname === "thumbnail") {
        allowedImageTypes.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Invalid image file type"), false);
    } else {
        cb(new Error("Unknown fieldname"), false);
    }
};

// Multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Export middleware
export const uploadModelFiles = upload.fields([
    { name: "model", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]);

// Helper: Delete file
const deleteFile = (filePath) => {
    try {
        let actualPath;
        
        if (filePath.startsWith("/models/")) {
            actualPath = path.join(__dirname, "..", "data", "models", path.basename(filePath));
        } else if (filePath.startsWith("/thumbnails/")) {
            actualPath = path.join(__dirname, "..", "data", "thumbnails", path.basename(filePath));
        } else {
            console.warn("Unknown file path:", filePath);
            return;
        }

        if (fs.existsSync(actualPath)) {
            fs.unlinkSync(actualPath);
            console.log("🗑️ Deleted:", actualPath);
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};

// Helper: Cleanup uploaded files
const cleanupUploadedFiles = (files) => {
    if (!files) return;

    if (files.model?.[0]) {
        deleteFile(`/models/${files.model[0].filename}`);
    }
    if (files.thumbnail?.[0]) {
        deleteFile(`/thumbnails/${files.thumbnail[0].filename}`);
    }
};

// Helper: Get file format from extension
const getFileFormat = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.glb') return 'glb';
    if (ext === '.gltf') return 'gltf';
    if (ext === '.fbx') return 'fbx';
    return null;
};

// 1. Upload 3D Model
export const uploadModel = async (req, res) => {
    try {
        console.log("📦 Upload request received");
        console.log("Files:", req.files);
        console.log("Body:", req.body);

        const modelFile = req.files?.model?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!modelFile) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({ message: "Model file is required" });
        }

        const { name, description } = req.body;

        if (!name) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({ message: "Model name is required" });
        }

        const modelPath = `/models/${modelFile.filename}`;
        const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : null;
        const format = getFileFormat(modelFile.filename);

        if (!format) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({ message: "Invalid model file format" });
        }

        // Save to database
        const newModel = await Model3D.create({
            name,
            description: description || null,
            modelPath,
            thumbnailPath,
            fileSize: modelFile.size,
            format
        });

        res.status(201).json({
            message: "Model uploaded successfully",
            model: {
                modelID: newModel.modelID,
                name: newModel.name,
                description: newModel.description,
                modelPath: newModel.modelPath,
                thumbnailPath: newModel.thumbnailPath,
                fileSize: newModel.fileSize,
                format: newModel.format,
                uploadDate: newModel.uploadDate
            }
        });

    } catch (error) {
        console.error("❌ Error uploading model:", error);
        cleanupUploadedFiles(req.files);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 2. Get all models
export const getAllModels = async (req, res) => {
    try {
        const { format, page = 1, limit = 10 } = req.query;

        const whereClause = {};
        if (format) {
            whereClause.format = format;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Model3D.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [['uploadDate', 'DESC']]
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            models: rows.map(model => ({
                modelID: model.modelID,
                name: model.name,
                description: model.description,
                modelPath: model.modelPath,
                thumbnailPath: model.thumbnailPath,
                fileSize: model.fileSize,
                format: model.format,
                uploadDate: model.uploadDate
            }))
        });

    } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 3. Get model by ID
export const getModelById = async (req, res) => {
    try {
        const { id } = req.params;

        const model = await Model3D.findByPk(id);

        if (!model) {
            return res.status(404).json({ message: "Model not found" });
        }

        res.status(200).json({
            modelID: model.modelID,
            name: model.name,
            description: model.description,
            modelPath: model.modelPath,
            thumbnailPath: model.thumbnailPath,
            fileSize: model.fileSize,
            format: model.format,
            uploadDate: model.uploadDate
        });

    } catch (error) {
        console.error("Error fetching model:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Update model
export const updateModel = async (req, res) => {
    try {
        const { id } = req.params;

        const model = await Model3D.findByPk(id);

        if (!model) {
            cleanupUploadedFiles(req.files);
            return res.status(404).json({ message: "Model not found" });
        }

        const { name, description } = req.body;
        const modelFile = req.files?.model?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        // Update name and description
        if (name) model.name = name;
        if (description !== undefined) model.description = description;

        // Update model file if provided
        if (modelFile) {
            deleteFile(model.modelPath);
            model.modelPath = `/models/${modelFile.filename}`;
            model.fileSize = modelFile.size;
            model.format = getFileFormat(modelFile.filename);
        }

        // Update thumbnail if provided
        if (thumbnailFile) {
            if (model.thumbnailPath) {
                deleteFile(model.thumbnailPath);
            }
            model.thumbnailPath = `/thumbnails/${thumbnailFile.filename}`;
        }

        await model.save();

        res.status(200).json({
            message: "Model updated successfully",
            model: {
                modelID: model.modelID,
                name: model.name,
                description: model.description,
                modelPath: model.modelPath,
                thumbnailPath: model.thumbnailPath,
                fileSize: model.fileSize,
                format: model.format,
                uploadDate: model.uploadDate
            }
        });

    } catch (error) {
        console.error("Error updating model:", error);
        cleanupUploadedFiles(req.files);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 5. Delete model
export const deleteModel = async (req, res) => {
    try {
        const { id } = req.params;

        const model = await Model3D.findByPk(id);

        if (!model) {
            return res.status(404).json({ message: "Model not found" });
        }

        // Delete files
        deleteFile(model.modelPath);
        if (model.thumbnailPath) {
            deleteFile(model.thumbnailPath);
        }

        // Delete from database
        await model.destroy();

        res.status(200).json({ message: "Model deleted successfully" });

    } catch (error) {
        console.error("Error deleting model:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 6. Search models
export const searchModels = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const models = await Model3D.findAll({
            where: {
                name: {
                    [Op.like]: `%${query}%`
                }
            },
            order: [['uploadDate', 'DESC']]
        });

        res.status(200).json({
            totalResults: models.length,
            models: models.map(model => ({
                modelID: model.modelID,
                name: model.name,
                description: model.description,
                modelPath: model.modelPath,
                thumbnailPath: model.thumbnailPath,
                fileSize: model.fileSize,
                format: model.format,
                uploadDate: model.uploadDate
            }))
        });

    } catch (error) {
        console.error("Error searching models:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};