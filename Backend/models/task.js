const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
});

module.exports = mongoose.model("Task", taskSchema);
