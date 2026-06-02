const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");

const AUTHOR_POPULATE = {
  path: "autorId",
  select: "nombre email bio avatarUrl createdAt",
};

const buildRecipeFilters = (query) => {
  const filters = {};

  if (query.categoria) {
    filters.categoria = query.categoria;
  }

  if (query.dificultad) {
    filters.dificultad = query.dificultad;
  }

  if (query.tags) {
    const tags = query.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tags.length > 0) {
      filters.tags = { $in: tags };
    }
  }

  return filters;
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getRecipes = async (req, res) => {
  try {
    const filters = buildRecipeFilters(req.query);

    const recipes = await Recipe.find(filters)
      .populate(AUTHOR_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las recetas",
    });
  }
};

const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      autorId: req.user.userId,
    };

    const recipe = await Recipe.create(recipeData);
    const populatedRecipe = await Recipe.findById(recipe._id).populate(
      AUTHOR_POPULATE
    );

    return res.status(201).json(populatedRecipe);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Datos de receta inválidos",
      });
    }

    return res.status(500).json({
      message: "Error al crear la receta",
    });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de receta inválido",
      });
    }

    const recipe = await Recipe.findById(id).populate(AUTHOR_POPULATE);

    if (!recipe) {
      return res.status(404).json({
        message: "Receta no encontrada",
      });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la receta",
    });
  }
};

const updateRecipe = async (req, res) => {
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

    if (recipe.autorId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "No tenés permiso para editar esta receta",
      });
    }

    Object.assign(recipe, req.body);
    recipe.autorId = recipe.autorId;

    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id).populate(
      AUTHOR_POPULATE
    );

    return res.status(200).json(populatedRecipe);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Datos de receta inválidos",
      });
    }

    return res.status(500).json({
      message: "Error al actualizar la receta",
    });
  }
};

const deleteRecipe = async (req, res) => {
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

    if (recipe.autorId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "No tenés permiso para eliminar esta receta",
      });
    }

    await Recipe.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Receta eliminada correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar la receta",
    });
  }
};

module.exports = {
  getRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
