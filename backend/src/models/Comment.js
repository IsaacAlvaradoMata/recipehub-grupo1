const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  recetaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  texto: {
    type: String,
    required: true,
    trim: true,
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
