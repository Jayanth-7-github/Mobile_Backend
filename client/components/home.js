import {React,  useState } from "react";
import { useTasks } from "./TaskContext";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Linking,
} from "react-native";
import WorkaholicLogo from "./WorkaholicLogo";

export default function HomeScreen({ username, token }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { tasks } = useTasks();
  const [loading] = useState(false); // No longer needed, but keep for UI compatibility
  const [filter, setFilter] = useState("all"); // all | pending | in-progress | completed | cancelled

  // ...existing code...

  const pendingTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "pending"
  );
  const inProgressTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "in-progress"
  );
  const completedTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  );
  const cancelledTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "cancelled"
  );

  // Decide which list to render
  let filteredTasks = tasks;
  if (filter === "pending") filteredTasks = pendingTasks;
  if (filter === "in-progress") filteredTasks = inProgressTasks;
  if (filter === "completed") filteredTasks = completedTasks;
  if (filter === "cancelled") filteredTasks = cancelledTasks;

  return (
    <View
      style={[styles.screenContainer, isDark && { backgroundColor: "#18181b" }]}
    >
      <Text style={[styles.title, isDark && { color: "#fff" }]}>
        Welcome Back!
      </Text>
      <View style={{ alignItems: "center", marginBottom: 12, marginTop: 8 }}>
        <WorkaholicLogo size={120} isDark={isDark} />
      </View>
      {/* <Text style={styles.subtitle}>Workaholic</Text> */}

      <View style={styles.filterRowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "all" && styles.activeBtn,
              isDark && {
                backgroundColor: filter === "all" ? "#2563eb" : "#23232a",
                borderColor: filter === "all" ? "#2563eb" : "#444",
              },
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.activeFilterText,
                isDark && { color: filter === "all" ? "#fff" : "#ccc" },
              ]}
            >
              All ({tasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "pending" && styles.activeBtn,
              isDark && {
                backgroundColor: filter === "pending" ? "#2563eb" : "#23232a",
                borderColor: filter === "pending" ? "#2563eb" : "#444",
              },
            ]}
            onPress={() => setFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "pending" && styles.activeFilterText,
                isDark && { color: filter === "pending" ? "#fff" : "#ccc" },
              ]}
            >
              Pending ({pendingTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "in-progress" && styles.activeBtn,
              isDark && {
                backgroundColor:
                  filter === "in-progress" ? "#2563eb" : "#23232a",
                borderColor: filter === "in-progress" ? "#2563eb" : "#444",
              },
            ]}
            onPress={() => setFilter("in-progress")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "in-progress" && styles.activeFilterText,
                isDark && { color: filter === "in-progress" ? "#fff" : "#ccc" },
              ]}
            >
              In-Progress ({inProgressTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "completed" && styles.activeBtn,
              isDark && {
                backgroundColor: filter === "completed" ? "#2563eb" : "#23232a",
                borderColor: filter === "completed" ? "#2563eb" : "#444",
              },
            ]}
            onPress={() => setFilter("completed")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "completed" && styles.activeFilterText,
                isDark && { color: filter === "completed" ? "#fff" : "#ccc" },
              ]}
            >
              Completed ({completedTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "cancelled" && styles.activeBtn,
              isDark && {
                backgroundColor: filter === "cancelled" ? "#2563eb" : "#23232a",
                borderColor: filter === "cancelled" ? "#2563eb" : "#444",
              },
            ]}
            onPress={() => setFilter("cancelled")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "cancelled" && styles.activeFilterText,
                isDark && { color: filter === "cancelled" ? "#fff" : "#ccc" },
              ]}
            >
              Cancelled ({cancelledTasks.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Task List */}
      <View
        style={[styles.summaryBox, isDark && { backgroundColor: "#23232a" }]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isDark ? "#60a5fa" : "#6200ee"}
          />
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => String(item.id || item._id)}
            renderItem={({ item }) => {
              // Check if description is a valid URL
              const urlRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i;
              const isLink =
                item.description && urlRegex.test(item.description.trim());
              return (
                <View
                  style={[
                    styles.taskItem,
                    isDark && {
                      backgroundColor: "#18181b",
                      borderColor: "#333",
                    },
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
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#fde047" : "#eab308",
                      marginTop: 2,
                    }}
                  >
                    Priority:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {item.priority || "-"}
                    </Text>
                  </Text>
                  {/* Link button if description is a valid URL */}
                  {isLink && (
                    <TouchableOpacity
                      style={{
                        marginTop: 8,
                        alignSelf: "flex-start",
                        backgroundColor: isDark ? "#2563eb" : "#6200ee",
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                      }}
                      onPress={() => Linking.openURL(item.description.trim())}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Open Link
                      </Text>
                    </TouchableOpacity>
                  )}
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  heroImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: "#f3f3f7",
    elevation: 4,
  },
  // subtitle: {
  //   fontSize: 22,
  //   fontWeight: "600",
  //   color: "#3730a3",
  //   marginBottom: 10,
  //   letterSpacing: 1,
  // },
  motivation: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 8,
  },
  summaryBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    width: "100%",
  },
  filterRowWrapper: {
    width: "100%",
    marginTop: 16,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    gap: 0,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f3f3f7",
  },
  activeBtn: {
    backgroundColor: "#6200ee",
    borderColor: "#6200ee",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskTitle: { fontWeight: "500", fontSize: 15 },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
});
