import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Set notification handler ONCE (outside component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationScreen({ username }) {
  const [notifications, setNotifications] = useState([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isFocused = useIsFocused();

  // Remove a notification by index
  const removeNotification = async (idx) => {
    try {
      const local = await AsyncStorage.getItem("localNotifications");
      let arr = local ? JSON.parse(local) : [];
      // Only keep notifications for this user
      arr = arr.filter((n) => n.user === username);
      arr.splice(idx, 1);
      await AsyncStorage.setItem("localNotifications", JSON.stringify(arr));
      setNotifications(arr);
    } catch (e) {
      console.warn("Failed to remove notification:", e);
    }
  };

  useEffect(() => {
    let subscription;

    const loadLocalNotifications = async () => {
      try {
        const local = await AsyncStorage.getItem("localNotifications");
        let arr = local ? JSON.parse(local) : [];
        // Only show notifications for this user
        arr = arr.filter((n) => n.user === username);
        setNotifications(arr);
      } catch (e) {
        console.warn("Failed to load notifications:", e);
      }
    };

    if (isFocused) {
      loadLocalNotifications();

      // Add listener for notifications received while app is open
      subscription = Notifications.addNotificationReceivedListener((notif) => {
        // Only add if notification is for this user
        if (
          notif.request?.content?.user === username ||
          notif?.content?.user === username ||
          notif.user === username
        ) {
          setNotifications((prev) => [notif, ...prev]);
        }
      });
    }

    // ✅ Cleanup listener when screen loses focus / unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isFocused, username]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: isDark ? "#18181b" : "#fff",
        paddingTop: 48,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 24,
          color: isDark ? "#60a5fa" : "#6200ee",
        }}
      >
        Notifications
      </Text>
      {notifications.length === 0 ? (
        <Text style={{ color: isDark ? "#aaa" : "#888" }}>
          No notifications yet.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <View
              style={{
                marginBottom: 18,
                padding: 16,
                borderRadius: 8,
                backgroundColor: isDark ? "#23232a" : "#f3f3f7",
                width: 320,
                shadowColor: isDark ? "#000" : "#ccc",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: isDark ? "#fff" : "#222",
                  }}
                >
                  {item.request?.content?.title ||
                    item?.content?.title ||
                    item.title ||
                    "(No Title)"}
                </Text>
                <Text style={{ color: isDark ? "#ccc" : "#444", marginTop: 4 }}>
                  {item.request?.content?.body ||
                    item?.content?.body ||
                    item.body ||
                    ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeNotification(index)}
                style={{ marginLeft: 12, padding: 4 }}
                accessibilityLabel="Delete notification"
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: isDark ? "#f87171" : "#b91c1c",
                  }}
                >
                  ❌
                </Text>
              </TouchableOpacity>
            </View>
          )}
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center" }}
        />
      )}
    </View>
  );
}
