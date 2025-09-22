const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  // Repeat options:
  repeat: {
    type: String,
    enum: ["once", "days", "date"],
    default: "once",
    required: true,
  },
  // If repeat is 'days', store array of weekday names
  days: { type: [String], default: [] }, // e.g., ['Monday', 'Wednesday']
  // If repeat is 'date', store array of dates and time
  dates: { type: [String], default: [] }, // e.g., ['2025-09-23', '2025-09-25']
  time: { type: String }, // e.g., '18:00'
});

// Update updatedAt on save

module.exports = mongoose.model("Task", taskSchema);
