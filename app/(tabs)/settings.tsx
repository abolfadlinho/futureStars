import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Colors } from "@/constants/Colors";

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.bodyText}>Body</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primaryColor,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.whiteColor,
  },
  bodyText: {
    fontSize: 18,
    color: "#333",
  },
});

export default SettingsScreen;
