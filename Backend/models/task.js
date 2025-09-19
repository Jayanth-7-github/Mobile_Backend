const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  taskTime: { type: Date }, // Scheduled time for the task
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  // Add more fields as needed
});

// Update updatedAt on save
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
