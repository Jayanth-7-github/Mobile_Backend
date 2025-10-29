import React from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";

// Accept onDayPress and markedDates as props for controlled usage
export default function CalendarScreen({ onDayPress, markedDates }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const today = new Date().toISOString().split("T")[0];
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      <Calendar
        onDayPress={onDayPress}
        markedDates={
          markedDates || {
            [today]: {
              selected: true,
              selectedColor: isDark ? "#bb86fc" : "#6200ee",
            },
          }
        }
        theme={{
          backgroundColor: isDark ? "#121212" : "#fff",
          calendarBackground: isDark ? "#121212" : "#fff",
          selectedDayBackgroundColor: isDark ? "#bb86fc" : "#6200ee",
          todayTextColor: isDark ? "#bb86fc" : "#6200ee",
          arrowColor: isDark ? "#bb86fc" : "#6200ee",
          dayTextColor: isDark ? "#fff" : "#222",
          monthTextColor: isDark ? "#fff" : "#222",
          textSectionTitleColor: isDark ? "#fff" : "#222",
          calendarTextColor: isDark ? "#fff" : "#222",
          textDisabledColor: isDark ? "#888" : "#ccc",
          selectedDayTextColor: isDark ? "#23232a" : "#fff",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "center",
  },
});
