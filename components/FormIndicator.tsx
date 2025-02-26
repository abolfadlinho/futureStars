import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  results: ("W" | "D" | "L" | "U")[]; // Array of match results
};

const FormIndicator: React.FC<Props> = ({ results }) => {
  return (
    <View style={styles.container}>
      {results.map((result, index) => (
        <View key={index} style={[styles.box, getBoxStyle(result)]}>
          <Text style={styles.text}>{result}</Text>
        </View>
      ))}
    </View>
  );
};

const getBoxStyle = (result: "W" | "D" | "L" | "U") => {
  switch (result) {
    case "W":
      return { backgroundColor: "#27ae60" }; // Green for win
    case "D":
      return { backgroundColor: "#f39c12" }; // Yellow for draw
    case "L":
      return { backgroundColor: "#e74c3c" }; // Red for loss
    case "U":
      return { backgroundColor: "#95a5a6" }; // Grey for unknown
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  box: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FormIndicator;
