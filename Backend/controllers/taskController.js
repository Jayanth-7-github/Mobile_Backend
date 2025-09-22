const Task = require("../models/task");

exports.getTasks = async (req, res) => {
  const user = req.user;
  try {
    const tasks = await Task.find({ user });
    res.json({
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        repeat: t.repeat,
        days: t.days,
        date: t.date,
        time: t.time,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.addTask = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    repeat, // 'once', 'days', or 'date'
    days, // array of weekday names
    date, // 'YYYY-MM-DD'
    time, // 'HH:mm'
  } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      repeat,
      days: Array.isArray(days) ? days : [],
      date,
      time,
    });
    res.json({
      success: true,
      task: {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        repeat: newTask.repeat,
        days: newTask.days,
        date: newTask.date,
        time: newTask.time,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.editTask = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    repeat, // 'once', 'days', or 'date'
    days, // array of weekday names
    date, // 'YYYY-MM-DD'
    time, // 'HH:mm'
  } = req.body;
  const { id } = req.params;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const updateFields = {
      title,
      description,
      status,
      priority,
      repeat,
      days: Array.isArray(days) ? days : [],
      date,
      time,
    };
    const task = await Task.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({
      success: true,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        repeat: task.repeat,
        days: task.days,
        date: task.date,
        time: task.time,
      },
    });
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
