import React, { useState } from "react";
import { useColorScheme } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";

const API_URL = "https://mobile-backend-plz0.onrender.com/api";

export default function SignupPage({ onSignup }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup() {
    if (!username || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert("Signup Success", "You can now log in.");
        onSignup();
      } else if (
        data.error &&
        data.error.toLowerCase().includes("username already exists")
      ) {
        // Suggest a username if already exists
        // Generate a suggestion by appending a random 3-digit number
        const suggestion =
          username.replace(/[^a-zA-Z0-9]/g, "") +
          Math.floor(100 + Math.random() * 900);
        Alert.alert(
          "Username Taken",
          `The username '${username}' is already taken. Try '${suggestion}' or choose another unique username.`
        );
      } else {
        Alert.alert("Signup Failed", data.error || "Could not sign up");
      }
    } catch (e) {
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
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
        <Text style={[styles.title, isDark && { color: "#fff" }]}>Sign up</Text>
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
        <TouchableOpacity
          style={[styles.button, isDark && { backgroundColor: "#2563eb" }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Sign up"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
        <View style={styles.rowCenter}>
          <Text style={{ color: isDark ? "#aaa" : "#888" }}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={onSignup}>
            <Text style={[styles.link, isDark && { color: "#60a5fa" }]}>
              Sign in
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
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
