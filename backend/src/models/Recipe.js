const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    unidad: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
    tiempoMin: {
      type: Number,
      required: true,
    },
    porciones: {
      type: Number,
      required: true,
    },
    dificultad: {
      type: String,
      required: true,
      enum: ["Fácil", "Media", "Difícil"],
      trim: true,
    },
    ingredientes: {
      type: [ingredientSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "La receta debe incluir al menos un ingrediente",
      },
    },
    pasos: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "La receta debe incluir al menos un paso",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    autorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imagenUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
