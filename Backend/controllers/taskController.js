const Task = require("../models/task");

exports.getTasks = async (req, res) => {
  const user = req.user;
  console.log("User from cookies/session:", user);
  try {
    const tasks = await Task.find({ user });
    res.json({
      user,
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        repeat: t.repeat,
        days: t.days,
        dates: t.dates,
        time: t.time,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: t.user,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.addTask = async (req, res) => {
  const user = req.user;
  console.log("User from cookies/session:", user);
  const {
    title,
    description,
    status,
    priority,
    repeat, // 'once', 'days', or 'date'
    days, // array of weekday names
    dates, // array of 'YYYY-MM-DD' for repeat='date'
    time, // 'HH:mm'
  } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const newTask = await Task.create({
      user,
      title,
      description,
      status,
      priority,
      repeat,
      days: Array.isArray(days) ? days : [],
      dates: Array.isArray(dates) ? dates : [],
      time,
    });
    res.json({
      success: true,
      user,
      task: {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        repeat: newTask.repeat,
        days: newTask.days,
        dates: newTask.dates,
        time: newTask.time,
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt,
        user: newTask.user,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.editTask = async (req, res) => {
  const user = req.user;
  console.log("User from cookies/session:", user);
  const {
    title,
    description,
    status,
    priority,
    repeat, // 'once', 'days', or 'date'
    days, // array of weekday names
    dates, // array of 'YYYY-MM-DD' for repeat='date'
    time, // 'HH:mm'
  } = req.body;
  const { id } = req.params;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const updateFields = {
      user,
      title,
      description,
      status,
      priority,
      repeat,
      days: Array.isArray(days) ? days : [],
      dates: Array.isArray(dates) ? dates : [],
      time,
    };
    const task = await Task.findOneAndUpdate({ _id: id, user }, updateFields, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({
      success: true,
      user,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        repeat: task.repeat,
        days: task.days,
        dates: task.dates,
        time: task.time,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        user: task.user,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteTask = async (req, res) => {
  const user = req.user;
  console.log("User from cookies/session:", user);
  const { id } = req.params;
  try {
    const result = await Task.findOneAndDelete({ _id: id, user });
    if (!result) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
