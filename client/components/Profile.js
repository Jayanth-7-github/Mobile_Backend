import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

export default function ProfileScreen({ username }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={[
        styles.screenContainer,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#bb86fc" : "#6200ee" }]}>
        Profile
      </Text>
      <Text style={[styles.label, { color: isDark ? "#fff" : "#222" }]}>
        Username:
      </Text>
      <Text style={[styles.value, { color: isDark ? "#fff" : "#444" }]}>
        {username}
      </Text>
      {/* Add more user info here if available */}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6200ee",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#222",
  },
  value: {
    fontSize: 18,
    color: "#444",
    marginBottom: 10,
  },
});
