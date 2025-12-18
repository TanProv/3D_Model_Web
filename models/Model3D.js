import { DataTypes } from "sequelize";
import { sequelize } from "../DB/index.js";

const Model3D = sequelize.define("Model3D", {
  modelID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  modelPath: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  thumbnailPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  format: {
    type: DataTypes.ENUM('glb', 'gltf', 'fbx'),
    allowNull: false,
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { 
  timestamps: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['format'] }
  ]
});

export default Model3D;