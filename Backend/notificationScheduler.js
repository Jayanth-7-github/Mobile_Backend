// Sends push notifications 30 minutes before task time
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const Task = require("./models/task");
const User = require("./models/user");

async function sendDueNotifications() {
  // Find tasks due in 30-31 minutes from now
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60000);
  const maxTime = new Date(now.getTime() + 31 * 60000);
  const tasks = await Task.find({
    taskTime: { $gte: minTime, $lt: maxTime },
    status: "pending",
  });
  for (const task of tasks) {
    const user = await User.findOne({ username: task.user });
    if (user && user.deviceToken) {
      try {
        await admin.messaging().send({
          notification: {
            title: `Upcoming Task: ${task.title}`,
            body: `Your task starts at ${task.taskTime.toLocaleString()}`,
          },
          token: user.deviceToken,
        });
        console.log(
          `Notification sent to ${user.username} for task ${task.title}`
        );
      } catch (e) {
        console.warn(
          `Failed to send notification to ${user.username}:`,
          e.message
        );
      }
    }
  }
}

module.exports = function startScheduler() {
  setInterval(sendDueNotifications, 60 * 1000); // Check every minute
};
