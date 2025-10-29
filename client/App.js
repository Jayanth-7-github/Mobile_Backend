import { StyleSheet, Text, View, useColorScheme, Animated } from "react-native";
import WorkaholicLogo from "./components/WorkaholicLogo";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginPage from "./LoginPage";
import HomeScreen from "./components/home";
import HamburgerMenu from "./components/HamburgerMenu";
import ProfileScreen from "./components/Profile";
import TasksScreen from "./components/task";
import SettingsScreen from "./components/setting";
import NotificationScreen from "./components/NotificationScreen"; // ✅ new import
import { StatusBar } from "expo-status-bar";
import { TaskProvider } from "./components/TaskContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // Animated loading hooks (always declared)
  const [progress] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Progress bar fill animation (loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Logo scale (pulsing animation)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Persist login info after login
  async function handleLogin(user, tok) {
    setUsername(user);
    setToken(tok);
    await AsyncStorage.setItem("username", user);
    await AsyncStorage.setItem("token", tok);
  }

  // Logout
  async function handleLogout() {
    try {
      await fetch("https://mobile-backend-plz0.onrender.com/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ username }),
      });
    } catch (e) {
      // ignore
    } finally {
      setUsername(null);
      setToken(null);
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("token");
    }
  }

  // Validate login on app start
  useEffect(() => {
    async function checkLogin() {
      try {
        const savedUser = await AsyncStorage.getItem("username");
        const savedToken = await AsyncStorage.getItem("token");
        if (savedUser && savedToken) {
          const res = await fetch(
            "https://mobile-backend-plz0.onrender.com/api/checklogin",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok && data.status) {
            setUsername(savedUser);
            setToken(savedToken);
          } else {
            setUsername(null);
            setToken(null);
            await AsyncStorage.removeItem("username");
            await AsyncStorage.removeItem("token");
          }
        }
      } catch (e) {
        setUsername(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  if (loading) {
    const widthInterpolate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#18181b" : "#fff",
        }}
      >
        {/* Animated SVG Logo (theme compatible) */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], marginBottom: 40 }}
        >
          <WorkaholicLogo size={100} />
        </Animated.View>

        {/* Progress Bar Background */}
        <View
          style={{
            width: 200,
            height: 10,
            backgroundColor: isDark ? "#333" : "#ddd",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          {/* Progress Fill */}
          <Animated.View
            style={{
              height: 10,
              borderRadius: 5,
              backgroundColor: isDark ? "#60a5fa" : "#6200ee",
              width: widthInterpolate,
            }}
          />
        </View>

        <Text
          style={{
            marginTop: 20,
            color: isDark ? "#aaa" : "#888",
            fontSize: 16,
          }}
        >
          Loading your workspace...
        </Text>
      </View>
    );
  }

  if (!username || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <TaskProvider token={token}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs">
                {() => (
                  <Tab.Navigator
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: isDark ? "#222" : "#6200ee",
                      },
                      headerTintColor: "#fff",
                      tabBarActiveTintColor: isDark ? "#bb86fc" : "#6200ee",
                      tabBarStyle: {
                        backgroundColor: isDark ? "#121212" : "#f8f8f8",
                      },
                    }}
                  >
                    {/* Home */}
                    <Tab.Screen
                      name="Home"
                      options={{
                        headerTitle: "Workaholic",
                        headerRight: () => (
                          <HamburgerMenu
                            onLogout={handleLogout}
                            username={username}
                          />
                        ),
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons
                            name="home-outline"
                            color={color}
                            size={size}
                          />
                        ),
                      }}
                    >
                      {() => <HomeScreen username={username} token={token} />}
                    </Tab.Screen>

                    {/* Tasks */}
                    <Tab.Screen
                      name="Tasks"
                      options={{
                        headerTitle: "Workaholic",
                        headerRight: () => (
                          <HamburgerMenu
                            onLogout={handleLogout}
                            username={username}
                          />
                        ),
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons
                            name="list-outline"
                            color={color}
                            size={size}
                          />
                        ),
                      }}
                    >
                      {() => <TasksScreen username={username} token={token} />}
                    </Tab.Screen>

                    {/* Notifications ✅ NEW */}
                    <Tab.Screen
                      name="Notifications"
                      options={{
                        headerTitle: "Workaholic",
                        headerRight: () => (
                          <HamburgerMenu
                            onLogout={handleLogout}
                            username={username}
                          />
                        ),
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons
                            name="notifications-outline"
                            color={color}
                            size={size}
                          />
                        ),
                      }}
                    >
                      {() => <NotificationScreen />}
                    </Tab.Screen>

                    {/* Settings */}
                    <Tab.Screen
                      name="Settings"
                      options={{
                        headerTitle: "Workaholic",
                        headerRight: () => (
                          <HamburgerMenu
                            onLogout={handleLogout}
                            username={username}
                          />
                        ),
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons
                            name="settings-outline"
                            color={color}
                            size={size}
                          />
                        ),
                      }}
                    >
                      {() => (
                        <SettingsScreen username={username} token={token} />
                      )}
                    </Tab.Screen>
                  </Tab.Navigator>
                )}
              </Stack.Screen>

              {/* Profile */}
              <Stack.Screen
                name="Profile"
                options={{
                  headerShown: true,
                  title: "Profile",
                  headerStyle: { backgroundColor: isDark ? "#222" : "#6200ee" },
                  headerTintColor: "#fff",
                }}
              >
                {() => <ProfileScreen username={username} />}
              </Stack.Screen>
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </TaskProvider>
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
    marginBottom: 12,
    color: "#6200ee",
  },
});
