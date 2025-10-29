import React, { createContext, useState, useContext, useEffect } from "react";

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children, token }) => {
  const [tasks, setTasks] = useState([]);

  // Helper to fetch tasks from backend
  const fetchTasks = async () => {
    if (!token) {
      setTasks([]);
      return;
    }
    try {
      const res = await fetch(
        "https://mobile-backend-plz0.onrender.com/api/tasks",
        {
          headers: { Authorization: token },
        }
      );
      const data = await res.json();
      setTasks(data.tasks ? data.tasks : data);
    } catch (e) {
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const addTask = async (task) => {
    try {
      const res = await fetch(
        "https://mobile-backend-plz0.onrender.com/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(task),
        }
      );
      // Always refetch after add
      await fetchTasks();
    } catch (e) {
      // handle error
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const res = await fetch(
        `https://mobile-backend-plz0.onrender.com/api/tasks/${updatedTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(updatedTask),
        }
      );
      // Always refetch after update
      await fetchTasks();
    } catch (e) {
      // handle error
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(
        `https://mobile-backend-plz0.onrender.com/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );
      // Always refetch after delete
      await fetchTasks();
    } catch (e) {
      // handle error
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, deleteTask, updateTask, token }}
    >
      {children}
    </TaskContext.Provider>
  );
};
