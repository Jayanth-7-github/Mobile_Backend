import React, { useState } from "react";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "react-native";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import SignupPage from "./SignupPage";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const API_URL = "https://mobile-backend-plz0.onrender.com/api";

export default function LoginPage({ onLogin }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res) {
        console.error("No response from login API");
        Alert.alert("Error", "No response from login API");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (res.ok && data.token) {
        // Call /api/checklogin with the token to verify authentication
        const checkRes = await fetch(`${API_URL}/checklogin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        if (!checkRes) {
          console.error("No response from checklogin API");
          Alert.alert("Error", "No response from checklogin API");
          setLoading(false);
          return;
        }
        const checkData = await checkRes.json();
        if (checkRes.ok && checkData.status) {
          // Request notification permissions before scheduling
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === "granted") {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Welcome Back!",
                body: `Welcome back, ${username}!`,
              },
              trigger: null,
            });
          } else {
            console.warn("Notification permission not granted");
          }
          onLogin(username, data.token);
        } else {
          console.error("Checklogin error:", checkData);
          Alert.alert("Login Error", checkData.error || "Session invalid");
        }
      } else {
        console.error("Login failed:", data);
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (e) {
      console.error("Fetch error:", e);
      Alert.alert("Error", `Could not connect to server: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (showSignup) {
    return <SignupPage onSignup={() => setShowSignup(false)} />;
  }

  return (
    <View style={[styles.outer, isDark && { backgroundColor: "#18181b" }]}>
      <View
        style={[
          styles.card,
          isDark && { backgroundColor: "#23232a", shadowColor: "#000" },
        ]}
      >
        <Text style={[styles.subtitle, isDark && { color: "#aaa" }]}>
          Please enter your details
        </Text>
        <Text style={[styles.title, isDark && { color: "#fff" }]}>
          Welcome back
        </Text>
        <TextInput
          placeholder="Email address"
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            isDark && {
              backgroundColor: "#23232a",
              color: "#fff",
              borderColor: "#444",
            },
          ]}
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          autoCapitalize="none"
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              { flex: 1 },
              isDark && {
                backgroundColor: "#23232a",
                color: "#fff",
                borderColor: "#444",
              },
            ]}
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={isDark ? "#aaa" : "#888"}
              style={{ marginLeft: -36, marginRight: 12 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRemember(!remember)}
          >
            <View
              style={[
                styles.checkbox,
                remember && styles.checkboxChecked,
                isDark && {
                  backgroundColor: remember ? "#4285f4" : "#23232a",
                  borderColor: remember ? "#4285f4" : "#444",
                },
              ]}
            />
            <Text style={[styles.checkboxLabel, isDark && { color: "#ccc" }]}>
              Remember for 30 days
            </Text>
          </TouchableOpacity>
          <Pressable
            onPress={() =>
              Alert.alert("Forgot password", "Feature not implemented.")
            }
          >
            <Text style={[styles.link, isDark && { color: "#60a5fa" }]}>
              Forgot password
            </Text>
          </Pressable>
        </View>
        <TouchableOpacity
          style={[styles.button, isDark && { backgroundColor: "#2563eb" }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
        <View style={styles.rowCenter}>
          <Text style={{ color: isDark ? "#aaa" : "#888" }}>
            Don't have an account?{" "}
          </Text>
          <Pressable onPress={() => setShowSignup(true)}>
            <Text style={[styles.link, isDark && { color: "#60a5fa" }]}>
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f9",
  },
  card: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "stretch",
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafbfc",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#4285f4",
    borderColor: "#4285f4",
  },
  checkboxLabel: {
    color: "#444",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4285f4",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#4285f4",
    fontWeight: "bold",
    fontSize: 15,
  },
});
