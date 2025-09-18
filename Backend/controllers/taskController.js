const Task = require("../models/task");

exports.getTasks = async (req, res) => {
  const user = req.user;
  try {
    const tasks = await Task.find({ user });
    res.json({ tasks: tasks.map((t) => ({ id: t._id, text: t.text })) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.addTask = async (req, res) => {
  const user = req.user;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  try {
    const newTask = await Task.create({ user, text });
    res.json({ success: true, task: { id: newTask._id, text: newTask.text } });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.editTask = async (req, res) => {
  const user = req.user;
  const { text } = req.body;
  const { id } = req.params;
  if (!text) return res.status(400).json({ error: "Text required" });
  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, user },
      { text },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true, task: { id: task._id, text: task.text } });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteTask = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const result = await Task.findOneAndDelete({ _id: id, user });
    if (!result) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
