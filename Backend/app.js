// Simple Express backend for tasks API
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const connectDB = require("./models/db");
const app = express();
const PORT = 5000;

const authController = require("./controllers/authController");
const taskController = require("./controllers/taskController");

// Simple in-memory session (for demo only)
const sessions = {};

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = sessions[token];
  next();
}

// Signup endpoint
app.post("/api/signup", authController.signup);

// Login endpoint
app.post("/api/login", authController.login(sessions));

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "tasks.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    return { users: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Task endpoints (auth required)
app.get("/api/tasks", authMiddleware, taskController.getTasks);
app.post("/api/tasks", authMiddleware, taskController.addTask);
app.put("/api/tasks/:id", authMiddleware, taskController.editTask);
app.delete("/api/tasks/:id", authMiddleware, taskController.deleteTask);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/api`);
  });
});
