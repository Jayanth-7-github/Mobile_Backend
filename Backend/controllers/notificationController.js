// Save Expo push token for the logged-in user
const User = require("../models/user");

// POST /api/save-push-token
// Body: { expoPushToken: string }
// Requires req.user to be set (auth middleware)
async function saveExpoPushToken(req, res) {
  try {
    const username = req.user;
    const { expoPushToken } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ error: "expoPushToken is required" });
    }
    const user = await User.findOneAndUpdate(
      { username },
      { expoPushToken },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ success: true, message: "Expo push token saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

module.exports.saveExpoPushToken = saveExpoPushToken;
const { Expo } = require("expo-server-sdk");
const User = require("../models/user"); // Assumes you store expoPushToken in user model
const Task = require("../models/task");
const expo = new Expo();

// Send a push notification to a single Expo token
async function sendPushNotification(expoPushToken, message) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }
  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      body: message,
      data: { withSome: "data" },
    },
  ];
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log(ticketChunk);
  } catch (error) {
    console.error(error);
  }
}

// Controller to check for tasks due in the next X minutes and send notifications
exports.sendDueTaskNotifications = async (req, res) => {
  const minutesBefore = parseInt(req.query.minutes) || 10;
  const now = new Date();
  const soon = new Date(now.getTime() + minutesBefore * 60000);

  try {
    // Find all tasks due in the next X minutes (for repeat: 'date')
    const tasks = await Task.find({
      repeat: "date",
      dates: {
        $elemMatch: {
          $gte: now.toISOString().slice(0, 10),
          $lte: soon.toISOString().slice(0, 10),
        },
      },
      time: soon.toTimeString().slice(0, 5),
    });

    for (const task of tasks) {
      // Find the user and their Expo push token
      const user = await User.findOne({ username: task.user });
      if (user && user.expoPushToken) {
        await sendPushNotification(
          user.expoPushToken,
          `Task "${task.title}" is due soon!`
        );
      }
    }
    res.json({
      success: true,
      message: "Notifications sent (if any due tasks found).",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};
