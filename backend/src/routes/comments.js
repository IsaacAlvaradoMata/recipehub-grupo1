const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  getCommentsByRecipe,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

router.get("/recetas/:id/comentarios", getCommentsByRecipe);
router.post("/recetas/:id/comentarios", authMiddleware, createComment);
router.delete("/comentarios/:id", authMiddleware, deleteComment);

module.exports = router;
