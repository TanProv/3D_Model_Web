import { DataTypes } from "sequelize";
import { sequelize } from "../DB/index.js";

const Jewelry = sequelize.define(
  "Jewelry",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    modelUrl: {
      type: DataTypes.STRING,
      allowNull: false, // link tới file .glb
    },

    thumbnailUrl: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "jewelries",
    timestamps: true,
  }
);

export default Jewelry;
