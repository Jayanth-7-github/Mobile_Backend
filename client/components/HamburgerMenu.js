import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HamburgerMenu({ onLogout, username }) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = StyleSheet.create({
    iconButton: {
      marginLeft: 16,
      borderRadius: 24,
      padding: 4,
      backgroundColor: isDark ? "#23232a" : "#f3f3f7",
      shadowColor: isDark ? "#000" : "#ccc",
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    overlay: {
      flex: 1,
      backgroundColor: isDark ? "rgba(24,24,27,0.7)" : "rgba(0,0,0,0.15)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
    },
    menu: {
      marginTop: 70,
      marginRight: 18,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 24,
      minWidth: 210,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e5e7eb",
      shadowColor: isDark ? "#000" : "#ccc",
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    menuTitle: {
      fontWeight: "bold",
      fontSize: 20,
      marginBottom: 18,
      color: isDark ? "#60a5fa" : "#6200ee",
      letterSpacing: 1,
      textAlign: "center",
    },
    menuItem: {
      fontSize: 17,
      marginBottom: 18,
      color: isDark ? "#fff" : "#23232a",
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    menuItemButton: {
      paddingVertical: 10,
      borderRadius: 8,
      marginBottom: 2,
    },
    menuItemLogout: {
      color: "#e11d48",
      fontWeight: "bold",
      fontSize: 17,
      letterSpacing: 0.2,
    },
    profileButton: {
      backgroundColor: isDark ? "#1e293b" : "#e0e7ff",
      borderRadius: 8,
      marginBottom: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#c7d2fe",
    },
    profileMenuItem: {
      color: isDark ? "#a5b4fc" : "#3730a3",
      fontWeight: "bold",
      fontSize: 17,
      marginRight: 8,
      letterSpacing: 0.2,
    },
    profileUsername: {
      color: isDark ? "#60a5fa" : "#6366f1",
      fontSize: 15,
      fontStyle: "italic",
    },
  });

  const handleProfilePress = () => {
    setVisible(false);
    if (navigation && navigation.navigate) {
      navigation.navigate("Profile");
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.iconButton}
      >
        <Ionicons name="menu" size={28} color={isDark ? "#fff" : "#222"} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity
              style={[styles.menuItemButton, styles.profileButton]}
              onPress={handleProfilePress}
            >
              <Text style={[styles.menuItem, styles.profileMenuItem]}>
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItemButton} onPress={onLogout}>
              <Text style={styles.menuItemLogout}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    marginLeft: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    marginTop: 60,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    minWidth: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  menuItem: {
    fontSize: 16,
    marginBottom: 16,
  },
  menuItemButton: {
    paddingVertical: 8,
  },
  menuItemLogout: {
    color: "#e11d48",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileButton: {
    backgroundColor: "#e0e7ff", // light indigo background
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  profileMenuItem: {
    color: "#3730a3", // indigo-800
    fontWeight: "bold",
    fontSize: 17,
    marginRight: 8,
  },
  profileUsername: {
    color: "#6366f1", // indigo-500
    fontSize: 15,
    fontStyle: "italic",
  },
});
