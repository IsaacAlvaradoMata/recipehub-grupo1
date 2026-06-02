const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

const USER_POPULATE = {
  path: "usuarioId",
  select: "nombre email bio avatarUrl createdAt",
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getCommentsByRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de receta inválido",
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Receta no encontrada",
      });
    }

    const comments = await Comment.find({ recetaId: id })
      .populate(USER_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los comentarios",
    });
  }
};

const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, calificacion } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de receta inválido",
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Receta no encontrada",
      });
    }

    if (!texto || calificacion === undefined) {
      return res.status(400).json({
        message: "texto y calificacion son requeridos",
      });
    }

    const comment = await Comment.create({
      recetaId: id,
      usuarioId: req.user.userId,
      texto,
      calificacion,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      USER_POPULATE
    );

    return res.status(201).json(populatedComment);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Datos de comentario inválidos",
      });
    }

    return res.status(500).json({
      message: "Error al crear el comentario",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de comentario inválido",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: "Comentario no encontrado",
      });
    }

    if (comment.usuarioId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "No tenés permiso para eliminar este comentario",
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Comentario eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el comentario",
    });
  }
};

module.exports = {
  getCommentsByRecipe,
  createComment,
  deleteComment,
};
