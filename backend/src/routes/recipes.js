const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  getRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const router = express.Router();

router.get("/", getRecipes);
router.post("/", authMiddleware, createRecipe);
router.get("/:id", getRecipeById);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;
