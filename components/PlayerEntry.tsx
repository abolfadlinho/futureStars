import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors"; // Adjust path as needed
import Ionicons from "react-native-vector-icons/Ionicons";

interface PlayerEntryProps {
  name: string;
  number: number;
  dob: string;
  onPress?: () => void;
  points?: number;
}

const PlayerEntry: React.FC<PlayerEntryProps> = ({
  name,
  number,
  dob,
  onPress,
  points,
}) => {
  const getAge = (dob: string) => {
    const givenDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - givenDate.getFullYear();
    let months = today.getMonth() - givenDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return years + "y" + months + "m";
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.jerseyContainer}>
        <Ionicons name="shirt" size={45} color={Colors.primaryColor} />
        <Text style={styles.jerseyNumber}>{number}</Text>
      </View>

      <View style={styles.playerName}>
        <Text style={styles.playerNameText}>{name}</Text>
        {points && <Text style={styles.ageText}>{getAge(dob)}</Text>}
      </View>

      <View style={styles.age}>
        {!points && <Text style={styles.ageText}>{getAge(dob)}</Text>}
        {points && <Text style={styles.ageText}>{points} Pts</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: 8,
    borderBottomColor: Colors.locked,
  },
  playerName: {
    alignItems: "center",
    justifyContent: "center",
  },
  age: {
    alignItems: "center",
    justifyContent: "center",
  },
  playerNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  ageText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  jerseyContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondaryColor,
    position: "absolute", // Puts the number on top of the shirt icon
  },
});

export default PlayerEntry;
