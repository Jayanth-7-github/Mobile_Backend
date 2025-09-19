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
        taskTime: t.taskTime,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        priority: t.priority,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.addTask = async (req, res) => {
  const user = req.user;
  const { title, description, status, taskTime, priority } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const newTask = await Task.create({
      user,
      title,
      description,
      status,
      taskTime,
      priority,
    });
    res.json({
      success: true,
      task: {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        taskTime: newTask.taskTime,
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt,
        priority: newTask.priority,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.editTask = async (req, res) => {
  const user = req.user;
  const { title, description, status, taskTime, priority } = req.body;
  const { id } = req.params;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const updateFields = {
      title,
      description,
      status,
      taskTime,
      priority,
      updatedAt: Date.now(),
    };
    const task = await Task.findOneAndUpdate({ _id: id, user }, updateFields, {
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
        taskTime: task.taskTime,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        priority: task.priority,
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
