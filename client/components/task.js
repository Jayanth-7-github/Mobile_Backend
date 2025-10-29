import React, { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTasks } from "./TaskContext";
import { useColorScheme } from "react-native";
import CalendarScreen from "./calender";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const API_URL = "https://mobile-backend-plz0.onrender.com/api/tasks";

export default function TasksScreen({ username, token }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { tasks, addTask, deleteTask, updateTask } = useTasks();
  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]); // for multi-date selection
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatDaily, setRepeatDaily] = useState(false);

  // ...existing code...

  async function handleSaveTask() {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required!");
      return;
    }
    try {
      // Format time as HH:mm
      const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      let repeat = "once";
      let days = [];
      let datesArr = [];
      if (repeatDaily) {
        repeat = "days";
        days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        datesArr = [];
      } else if (selectedDates.length > 0) {
        repeat = "date";
        datesArr = selectedDates;
        days = [];
      } else {
        repeat = "once";
        datesArr = [date.toISOString().split("T")[0]];
        days = [];
      }
      const newTask = {
        user: username,
        title,
        description,
        status,
        priority,
        repeat,
        days,
        dates: datesArr,
        time: timeStr,
        token: token,
      };
      // Schedule notifications for each selected date
      for (const dateStr of newTask.dates) {
        const taskDate = new Date(
          dateStr + "T" + date.toTimeString().slice(0, 5)
        );
        const notificationTime = new Date(taskDate.getTime() - 30 * 60 * 1000);
        const now = new Date();
        const triggerDate = notificationTime > now ? notificationTime : now;
        const notifContent = {
          title: "Task Reminder",
          body: `Your task ${
            newTask.title
          } is about to complete in 30 minutes (due at ${taskDate.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}).`,
        };
        // Request notification permission before scheduling
        const { status: notifStatus } =
          await Notifications.requestPermissionsAsync();
        if (notifStatus === "granted") {
          await Notifications.scheduleNotificationAsync({
            content: notifContent,
            trigger: repeatDaily
              ? {
                  hour: triggerDate.getHours(),
                  minute: triggerDate.getMinutes(),
                  repeats: true,
                  channelId: "default",
                }
              : {
                  date: triggerDate,
                  channelId: "default",
                },
          });
          // Save to AsyncStorage for NotificationScreen
          try {
            const existing = await AsyncStorage.getItem("localNotifications");
            const arr = existing ? JSON.parse(existing) : [];
            arr.unshift({
              content: notifContent,
              scheduledFor: triggerDate.toISOString(),
              taskId: newTask.id,
              type: editingId ? "edit" : "add",
              repeatDaily,
              date: dateStr,
            });
            await AsyncStorage.setItem(
              "localNotifications",
              JSON.stringify(arr)
            );
            console.log(
              "Saved scheduled notification to AsyncStorage:",
              arr[0]
            );
          } catch (e) {
            console.warn("Failed to save notification locally:", e);
          }
        } else {
          Alert.alert("Notification permission not granted.");
        }
      }
      if (editingId) {
        // Use _id for update
        updateTask({ ...newTask, _id: editingId });
      } else {
        addTask(newTask);
      }
      resetForm();
    } catch (e) {
      Alert.alert("Error", "Something went wrong.");
      console.error("Save task error:", e);
    }
  }

  function handleDeleteTask(id) {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Use _id for delete
            deleteTask(id);
            // Remove the notification for this task from AsyncStorage
            try {
              const existing = await AsyncStorage.getItem("localNotifications");
              let arr = existing ? JSON.parse(existing) : [];
              arr = arr.filter((n) => n.taskId !== id);
              await AsyncStorage.setItem(
                "localNotifications",
                JSON.stringify(arr)
              );
            } catch (e) {
              console.warn(
                "Failed to remove notification for deleted task:",
                e
              );
            }
          },
        },
      ]
    );
  }

  function handleEditTask(task) {
    setEditingId(task._id || task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setDate(
      task.taskTime
        ? new Date(task.taskTime)
        : task.date
        ? new Date(task.date)
        : new Date()
    );
    setRepeatDaily(!!task.repeatDaily);
    setSelectedDates(task.selectedDates || []);
    setShowModal(true);
    // The notification will be scheduled and saved when the user saves the edit (handleSaveTask)
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
    setPriority("medium");
    setDate(new Date());
    setShowModal(false);
  }

  // Filtered tasks
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description &&
        t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View
      style={[styles.screenContainer, isDark && { backgroundColor: "#18181b" }]}
    >
      <Text style={[styles.title, isDark && { color: "#fff" }]}>Tasks</Text>

      {/* Search + Add */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search tasks..."
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            isDark && {
              backgroundColor: "#23232a",
              color: "#fff",
              borderColor: "#444",
            },
          ]}
          placeholderTextColor={isDark ? "#aaa" : "#888"}
        />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, isDark && styles.fabDark]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => {
          // Custom due display logic
          let dueDisplay = "";
          if (item.repeat === "days" && item.days && item.days.length > 0) {
            dueDisplay = `Repeats: ${item.days.join(", ")} at ${item.time}`;
          } else if (
            item.repeat === "date" &&
            item.dates &&
            item.dates.length > 0
          ) {
            dueDisplay = `Dates: ${item.dates.join(", ")} at ${item.time}`;
          } else if (
            item.repeat === "once" &&
            item.dates &&
            item.dates.length > 0
          ) {
            dueDisplay = `Due: ${item.dates[0]} at ${item.time}`;
          } else {
            dueDisplay = `Time: ${item.time}`;
          }
          return (
            <View
              style={[
                styles.taskCard,
                isDark && { backgroundColor: "#23232a", borderColor: "#333" },
                item.status?.toLowerCase() === "completed" && {
                  backgroundColor: isDark ? "#134e4a" : "#e0f7ef",
                },
              ]}
            >
              <Text
                style={[
                  styles.taskTitle,
                  isDark && { color: "#fff" },
                  item.status?.toLowerCase() === "completed" && {
                    color: isDark ? "#4ade80" : "#059669",
                    textDecorationLine: "line-through",
                  },
                ]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text style={isDark && { color: "#ccc" }}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={[styles.meta, isDark && { color: "#aaa" }]}>
                Status:{" "}
                <Text
                  style={{
                    color: isDark ? "#60a5fa" : "#2563eb",
                    fontWeight: "bold",
                  }}
                >
                  {item.status}
                </Text>{" "}
                | Priority:{" "}
                <Text
                  style={{
                    color: isDark ? "#fde047" : "#eab308",
                    fontWeight: "bold",
                  }}
                >
                  {item.priority}
                </Text>
              </Text>
              {dueDisplay && (
                <Text style={[styles.meta, isDark && { color: "#aaa" }]}>
                  {dueDisplay}
                </Text>
              )}
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleEditTask(item)}>
                  <Text
                    style={[styles.editBtn, isDark && { color: "#60a5fa" }]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteTask(item.id || item._id)}
                >
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDark && { color: "#aaa" }]}>
            No tasks found.
          </Text>
        }
        style={{ width: "100%" }}
      />

      {/* Add/Edit Task Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View
              style={[
                styles.modalBox,
                isDark && { backgroundColor: "#23232a" },
              ]}
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalTitle, isDark && { color: "#fff" }]}>
                  {editingId ? "Edit Task" : "Add Task"}
                </Text>
                <TextInput
                  placeholder="Title *"
                  value={title}
                  onChangeText={setTitle}
                  style={[
                    styles.input,
                    !title.trim() && styles.inputError,
                    isDark && {
                      backgroundColor: "#23232a",
                      color: "#fff",
                      borderColor: "#444",
                    },
                  ]}
                  placeholderTextColor={isDark ? "#aaa" : "#888"}
                  autoFocus
                  returnKeyType="next"
                  maxLength={60}
                />
                {!title.trim() && (
                  <Text style={styles.validationText}>Title is required.</Text>
                )}

                <TextInput
                  placeholder="Description (optional)"
                  value={description}
                  onChangeText={setDescription}
                  style={[
                    styles.input,
                    { height: 70, textAlignVertical: "top" },
                    isDark && {
                      backgroundColor: "#23232a",
                      color: "#fff",
                      borderColor: "#444",
                    },
                  ]}
                  placeholderTextColor={isDark ? "#aaa" : "#888"}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />

                {/* Multi-date Picker */}
                {!repeatDaily && (
                  <>
                    <Text style={[styles.label, isDark && { color: "#fff" }]}>
                      Dates
                    </Text>
                    <CalendarScreen
                      onDayPress={(day) => {
                        const dateStr = day.dateString;
                        setSelectedDates((prev) => {
                          // Toggle selection: deselect if already selected, select if not
                          if (prev.includes(dateStr)) {
                            return prev.filter((d) => d !== dateStr);
                          } else {
                            return [...prev, dateStr];
                          }
                        });
                      }}
                      markedDates={
                        selectedDates.length > 0
                          ? Object.fromEntries(
                              selectedDates.map((d) => [
                                d,
                                { selected: true, selectedColor: "#6200ee" },
                              ])
                            )
                          : {
                              [date.toISOString().split("T")[0]]: {
                                selected: true,
                                selectedColor: "#6200ee",
                              },
                            }
                      }
                    />
                  </>
                )}

                {/* Time Picker */}
                <Text style={[styles.label, isDark && { color: "#fff" }]}>
                  Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.timeBtn,
                    isDark && {
                      backgroundColor: "#23232a",
                      borderColor: "#444",
                    },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text
                    style={[styles.timeBtnText, isDark && { color: "#fff" }]}
                  >
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(false);
                      if (selectedDate) {
                        const newDate = new Date(date);
                        newDate.setHours(selectedDate.getHours());
                        newDate.setMinutes(selectedDate.getMinutes());
                        setDate(newDate);
                      }
                    }}
                  />
                )}

                {/* Repeat Daily Switch */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={[
                      styles.label,
                      isDark && { color: "#fff" },
                      { flex: 1 },
                    ]}
                  >
                    Repeat every day
                  </Text>
                  <Switch
                    value={repeatDaily}
                    onValueChange={setRepeatDaily}
                    thumbColor={
                      repeatDaily
                        ? isDark
                          ? "#60a5fa"
                          : "#2563eb"
                        : isDark
                        ? "#444"
                        : "#ccc"
                    }
                    trackColor={{
                      false: isDark ? "#333" : "#ccc",
                      true: isDark ? "#2563eb" : "#60a5fa",
                    }}
                  />
                </View>

                {/* Status Picker */}
                <Text style={[styles.label, isDark && { color: "#fff" }]}>
                  Status
                </Text>
                <View
                  style={[
                    styles.pickerWrapper,
                    isDark && {
                      backgroundColor: "#23232a",
                      borderColor: "#444",
                    },
                  ]}
                >
                  <Picker
                    selectedValue={status}
                    onValueChange={setStatus}
                    style={[
                      styles.picker,
                      isDark && { color: "#fff", backgroundColor: "#23232a" },
                    ]}
                    dropdownIconColor={isDark ? "#fff" : undefined}
                  >
                    <Picker.Item
                      label="Pending"
                      value="pending"
                      color={isDark ? "#fff" : undefined}
                    />
                    <Picker.Item
                      label="In Progress"
                      value="in-progress"
                      color={isDark ? "#fff" : undefined}
                    />
                    <Picker.Item
                      label="Completed"
                      value="completed"
                      color={isDark ? "#fff" : undefined}
                    />
                    <Picker.Item
                      label="Cancelled"
                      value="cancelled"
                      color={isDark ? "#fff" : undefined}
                    />
                  </Picker>
                </View>

                {/* Priority Picker */}
                <Text style={[styles.label, isDark && { color: "#fff" }]}>
                  Priority
                </Text>
                <View
                  style={[
                    styles.pickerWrapper,
                    isDark && {
                      backgroundColor: "#23232a",
                      borderColor: "#444",
                    },
                  ]}
                >
                  <Picker
                    selectedValue={priority}
                    onValueChange={setPriority}
                    style={[
                      styles.picker,
                      isDark && { color: "#fff", backgroundColor: "#23232a" },
                    ]}
                    dropdownIconColor={isDark ? "#fff" : undefined}
                  >
                    <Picker.Item
                      label="Low"
                      value="low"
                      color={isDark ? "#fff" : undefined}
                    />
                    <Picker.Item
                      label="Medium"
                      value="medium"
                      color={isDark ? "#fff" : undefined}
                    />
                    <Picker.Item
                      label="High"
                      value="high"
                      color={isDark ? "#fff" : undefined}
                    />
                  </Picker>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={resetForm}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: isDark ? "#aaa" : "#888" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      !title.trim() && styles.disabledBtn,
                      isDark && {
                        backgroundColor: !title.trim() ? "#333" : "#2563eb",
                      },
                    ]}
                    onPress={handleSaveTask}
                    disabled={!title.trim()}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        !title.trim() && styles.disabledBtnText,
                      ]}
                    >
                      {editingId ? "Save" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#6200ee",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 10,
  },
  fabDark: {
    backgroundColor: "#2563eb",
  },
  fabIcon: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: -2,
  },
  screenContainer: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6200ee",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  taskTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  meta: { color: "#666", fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: "row", marginTop: 8 },
  editBtn: { color: "#6200ee", marginRight: 16 },
  deleteBtn: { color: "red" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%", // ✅ makes it smaller & scrollable
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#fafbfc",
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
    backgroundColor: "#fff0f0",
  },
  validationText: {
    color: "red",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 2,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: "#6200ee",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 0,
    marginRight: 10,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledBtn: {
    backgroundColor: "#ccc",
  },
  disabledBtnText: {
    color: "#eee",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 22,
    marginTop: 8,
    overflow: "hidden",
    backgroundColor: "#f3f3f7",
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f3f3f7",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  timeBtnText: {
    fontSize: 16,
    color: "#3730a3",
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    height: 52,
    fontSize: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
});
