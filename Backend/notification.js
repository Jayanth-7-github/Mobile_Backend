// notification.js
const admin = require("firebase-admin");
const fetch = require("node-fetch");

function sendFCMNotification(deviceToken, title, body) {
  if (!admin.apps.length) {
    throw new Error("FCM not initialized.");
  }
  const message = {
    notification: { title, body },
    token: deviceToken,
  };
  return admin.messaging().send(message);
}

async function sendExpoNotification(expoPushToken, title, body) {
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
  return response.json();
}

function notificationRoutes(app, admin, fcmInitialized, User, authMiddleware) {
  // FCM notification endpoint
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
      const response = await sendFCMNotification(deviceToken, title, body);
      res.json({ success: true, response });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Notification send failed", details: e.message });
    }
  });

  // Expo notification endpoint
  app.post("/api/send-expo-notification", async (req, res) => {
    const { expoPushToken, title, body } = req.body;
    if (!expoPushToken || !title || !body) {
      return res
        .status(400)
        .json({ error: "expoPushToken, title, and body required" });
    }
    try {
      const result = await sendExpoNotification(expoPushToken, title, body);
      res.json({ success: true, result });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Expo notification send failed", details: e.message });
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
        return res
          .status(400)
          .json({ error: "No device token found for user." });
      }
      await sendFCMNotification(
        user.deviceToken,
        "Welcome Back!",
        `Welcome back, ${username}! This is a test notification.`
      );
      res.json({ success: true, message: "Test notification sent." });
    } catch (e) {
      res
        .status(500)
        .json({
          error: "Failed to send test notification",
          details: e.message,
        });
    }
  });

  // Unified endpoint to send notification to a user (FCM or Expo)
  app.post("/api/send-user-notification", authMiddleware, async (req, res) => {
    const username = req.user;
    const { title, body } = req.body;
    if (!username || !title || !body) {
      return res
        .status(400)
        .json({ error: "Missing username, title, or body" });
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
          const response = await sendFCMNotification(
            user.deviceToken,
            title,
            body
          );
          return res.json({ success: true, method: "FCM", response });
        } catch (e) {
          // FCM failed, try Expo if available
          console.warn("FCM send failed, trying Expo:", e.message);
        }
      }
      // Try Expo
      if (user.expoPushToken) {
        try {
          const result = await sendExpoNotification(
            user.expoPushToken,
            title,
            body
          );
          return res.json({ success: true, method: "Expo", result });
        } catch (e) {
          return res
            .status(500)
            .json({
              error: "Expo notification send failed",
              details: e.message,
            });
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
}

module.exports = {
  sendFCMNotification,
  sendExpoNotification,
  notificationRoutes,
};
