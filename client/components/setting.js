import React, { useState, useEffect } from "react";
import { useTasks } from "./TaskContext";
import { useColorScheme } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import CalendarScreen from "./calender";

export default function SettingsScreen({ username, token }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const { tasks } = useTasks();
  const [loading] = useState(false); // No longer needed, but keep for UI compatibility
  const [error] = useState(null); // No longer needed, but keep for UI compatibility

  // Format selectedDate to YYYY-MM-DD
  const selectedDateString = selectedDate.toISOString().split("T")[0];

  // ...existing code...

  return (
    <View
      style={[styles.screenContainer, isDark && { backgroundColor: "#18181b" }]}
    >
      <Text style={[styles.title, isDark && { color: "#fff" }]}>Settings</Text>
      {/* Current time below heading */}
      <Text
        style={{
          fontSize: 18,
          color: isDark ? "#a5b4fc" : "#2563eb",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </Text>
      {/* Interactive Calendar component below the title */}
      <View style={{ width: "100%", flex: 1 }}>
        <CalendarScreen
          onDayPress={(day) => {
            const [year, month, dayNum] = day.dateString.split("-");
            const newDate = new Date(selectedDate);
            newDate.setFullYear(Number(year));
            newDate.setMonth(Number(month) - 1);
            newDate.setDate(Number(dayNum));
            setSelectedDate(newDate);
          }}
          markedDates={{
            [selectedDateString]: {
              selected: true,
              selectedColor: "#6200ee",
            },
          }}
        />
        <View style={{ marginTop: 16, flex: 1 }}>
          <Text style={[styles.taskTitle, isDark && { color: "#fff" }]}>
            Tasks for {selectedDateString}:
          </Text>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#60a5fa" : "#6200ee"}
              style={{ marginTop: 12 }}
            />
          ) : error ? (
            <Text style={[styles.noTaskText, isDark && { color: "#aaa" }]}>
              {error}
            </Text>
          ) : (
            (() => {
              const filteredTasks = tasks.filter((task) => {
                const selectedWeekday = selectedDate.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                  }
                );
                const selectedDateStr = selectedDate
                  .toISOString()
                  .split("T")[0];
                if (task.repeat === "days" && Array.isArray(task.days)) {
                  // Show if the selected day of week is in the repeat days
                  return task.days.includes(selectedWeekday);
                } else if (
                  task.repeat === "date" &&
                  Array.isArray(task.dates)
                ) {
                  // Show if the selected date is in the repeat dates
                  return task.dates.includes(selectedDateStr);
                } else if (
                  task.repeat === "once" &&
                  Array.isArray(task.dates)
                ) {
                  // Show if the selected date matches the one-time date
                  return task.dates[0] === selectedDateStr;
                }
                return false;
              });
              if (filteredTasks.length === 0) {
                return (
                  <Text
                    style={[styles.noTaskText, isDark && { color: "#aaa" }]}
                  >
                    No tasks for this day.
                  </Text>
                );
              }
              return (
                <FlatList
                  data={filteredTasks}
                  keyExtractor={(item) =>
                    item.id?.toString() ||
                    item._id?.toString() ||
                    Math.random().toString()
                  }
                  renderItem={({ item }) => {
                    let timeStr = null;
                    let taskDateStr =
                      item.taskTime || item.date || item.createdAt;
                    if (taskDateStr) {
                      let d = new Date(taskDateStr);
                      if (!isNaN(d)) {
                        timeStr = d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                    }
                    return (
                      <View
                        style={[
                          styles.taskItem,
                          isDark && { backgroundColor: "#23232a" },
                        ]}
                      >
                        <Text
                          style={[styles.taskText, isDark && { color: "#fff" }]}
                        >
                          {item.title || item.name || "Untitled Task"}
                        </Text>
                        {timeStr && (
                          <Text
                            style={{
                              fontSize: 13,
                              color: isDark ? "#a5b4fc" : "#6366f1",
                              marginTop: 2,
                            }}
                          >
                            Time: {timeStr}
                          </Text>
                        )}
                        <Text
                          style={{
                            fontSize: 14,
                            color: isDark ? "#60a5fa" : "#2563eb",
                            marginTop: 2,
                          }}
                        >
                          Status:{" "}
                          <Text style={{ fontWeight: "bold" }}>
                            {item.status || "-"}
                          </Text>{" "}
                          | Priority:{" "}
                          <Text
                            style={{
                              fontWeight: "bold",
                              color: isDark ? "#fde047" : "#eab308",
                            }}
                          >
                            {item.priority || "-"}
                          </Text>
                          {item.time ? (
                            <>
                              {" "}
                              | Time:{" "}
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  color: isDark ? "#a5b4fc" : "#6366f1",
                                }}
                              >
                                {item.time}
                              </Text>
                            </>
                          ) : null}
                        </Text>
                      </View>
                    );
                  }}
                />
              );
            })()
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6200ee",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  noTaskText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
  taskItem: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    color: "#222",
  },
});
