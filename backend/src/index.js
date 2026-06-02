require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes (se agregan después)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
