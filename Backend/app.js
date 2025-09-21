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

// --- Endpoint to send FCM push notification ---
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

// --- Endpoint to send Expo push notification ---
const fetch = require("node-fetch");
app.post("/api/send-expo-notification", async (req, res) => {
  const { expoPushToken, title, body } = req.body;
  if (!expoPushToken || !title || !body) {
    return res
      .status(400)
      .json({ error: "expoPushToken, title, and body required" });
  }
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: { someData: "value" },
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    res.json({ success: true, result });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Expo notification send failed", details: e.message });
  }
});
// Add this endpoint to update device token for logged-in user
// Update device token endpoint to support both FCM and Expo tokens
app.post("/api/update-device-token", authMiddleware, async (req, res) => {
  const { deviceToken, expoPushToken } = req.body;
  const username = req.user;
  if (!username) {
    return res.status(400).json({ error: "Missing user" });
  }
  if (!deviceToken && !expoPushToken) {
    return res.status(400).json({ error: "No token provided" });
  }
  try {
    const update = {};
    if (deviceToken) update.deviceToken = deviceToken;
    if (expoPushToken) update.expoPushToken = expoPushToken;
    await User.findOneAndUpdate({ username }, update);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update device token(s)" });
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
// Unified endpoint to send notification to a user (FCM or Expo)
app.post("/api/send-user-notification", authMiddleware, async (req, res) => {
  const username = req.user;
  const { title, body } = req.body;
  if (!username || !title || !body) {
    return res.status(400).json({ error: "Missing username, title, or body" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Try FCM first
    if (user.deviceToken) {
      if (!fcmInitialized) {
        return res.status(503).json({ error: "FCM not initialized." });
      }
      try {
        const message = {
          notification: { title, body },
          token: user.deviceToken,
        };
        const response = await admin.messaging().send(message);
        return res.json({ success: true, method: "FCM", response });
      } catch (e) {
        // FCM failed, try Expo if available
        console.warn("FCM send failed, trying Expo:", e.message);
      }
    }
    // Try Expo
    if (user.expoPushToken) {
      try {
        const message = {
          to: user.expoPushToken,
          sound: "default",
          title,
          body,
          data: { someData: "value" },
        };
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });
        const result = await response.json();
        return res.json({ success: true, method: "Expo", result });
      } catch (e) {
        return res
          .status(500)
          .json({ error: "Expo notification send failed", details: e.message });
      }
    }
    // No token found
    return res.status(400).json({ error: "No push token found for user." });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Failed to send notification", details: e.message });
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