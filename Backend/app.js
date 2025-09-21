// Simple Express backend for tasks API
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");

const connectDB = require("./models/db");
const authController = require("./controllers/authController");
const taskController = require("./controllers/taskController");
const User = require("./models/user");

// Create express app early (before routes)
const app = express();
const PORT = 5000;

// --- Push Notification Setup (Firebase Cloud Messaging) ---
const fcmKeyPath = path.join(__dirname, "firebase-service-account.json");
let fcmInitialized = false;
if (fs.existsSync(fcmKeyPath)) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(fcmKeyPath)),
    });
    fcmInitialized = true;
  } catch (e) {
    console.warn("FCM initialization failed:", e.message);
  }
} else {
  console.warn(
    "FCM not initialized. Add firebase-service-account.json for push notifications."
  );
}

// Simple in-memory session (for demo only)
const sessions = {};

function authMiddleware(req, res, next) {
  // Check token in cookies first, then headers
  const token = req.cookies.token || req.headers["authorization"];
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = sessions[token];
  next();
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Signup endpoint
app.post("/api/signup", authController.signup);

// Login endpoint
app.post("/api/login", authController.login(sessions));

// Logout endpoint
app.post("/api/logout", authController.logout(sessions));

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

// Check login endpoint
app.get("/api/checklogin", authMiddleware, async (req, res) => {
  try {
    const username = req.user;
    if (!username) {
      return res.status(400).json({ error: "User id not found" });
    }
    const user = await User.findOne({ username }).select("username");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ status: true, message: user });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Endpoint to send push notification ---
app.post("/api/send-notification", async (req, res) => {
  if (!fcmInitialized) {
    return res.status(503).json({
      error: "FCM not initialized. Add firebase-service-account.json.",
    });
  }
  const { deviceToken, title, body } = req.body;
  if (!deviceToken || !title || !body) {
    return res
      .status(400)
      .json({ error: "deviceToken, title, and body required" });
  }
  try {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Notification send failed", details: e.message });
  }
});
// Add this endpoint to update device token for logged-in user
app.post("/api/update-device-token", authMiddleware, async (req, res) => {
  const { deviceToken } = req.body;
  const username = req.user;
  if (!deviceToken || !username) {
    return res.status(400).json({ error: "Missing deviceToken or user" });
  }
  try {
    await User.findOneAndUpdate({ username }, { deviceToken });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update device token" });
  }
});
// Dummy notification endpoint for testing
app.post("/api/test-notification", authMiddleware, async (req, res) => {
  if (!fcmInitialized) {
    return res.status(503).json({ error: "FCM not initialized." });
  }
  const username = req.user;
  try {
    const user = await User.findOne({ username });
    if (!user || !user.deviceToken) {
      return res.status(400).json({ error: "No device token found for user." });
    }
    await admin.messaging().send({
      notification: {
        title: "Welcome Back!",
        body: `Welcome back, ${username}! This is a test notification.`,
      },
      token: user.deviceToken,
    });
    res.json({ success: true, message: "Test notification sent." });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Failed to send test notification", details: e.message });
  }
});

const startScheduler = require("./notificationScheduler");
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/api`);
    if (fcmInitialized) {
      startScheduler();
      console.log("Notification scheduler started.");
    }
  });
});
