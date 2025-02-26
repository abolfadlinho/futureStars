import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Colors from "../constants/Colors"; // Adjust path as needed
import Icon from "react-native-vector-icons/FontAwesome";
import getLogo from "@/constants/Logos";

interface PlayerMatchEntryProps {
  teamAName: string;
  teamALogo: string;
  teamBName: string;
  teamBLogo: string;
  finalScore: { A: number; B: number };
  date: string;
  points: number;
  isMotm: boolean;
}

const PlayerMatchEntry: React.FC<PlayerMatchEntryProps> = ({
  teamAName,
  teamALogo,
  teamBName,
  teamBLogo,
  finalScore,
  date,
  points,
  isMotm,
}) => {
  return (
    <View style={styles.container}>
      {/* Player Points Section (Smaller Width) */}
      <View style={styles.pointsContainer}>
        {isMotm ? (
          <View style={styles.motmContainer}>
            <Icon name="star" size={28} color={Colors.secondaryColor} />
            <Text style={styles.pointsText}>{points} Pts</Text>
          </View>
        ) : (
          <Text style={styles.pointsText}>{points} Pts</Text>
        )}
      </View>

      {/* Team A */}
      <View style={styles.teamContainer}>
        <Image source={getLogo(teamALogo)} style={styles.teamLogo} />
        <Text style={styles.teamName}>{teamAName}</Text>
      </View>

      {/* Match Details */}
      <View style={styles.matchDetails}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.score}>
          {finalScore.A} - {finalScore.B}
        </Text>
      </View>

      {/* Team B */}
      <View style={styles.teamContainer}>
        <Image source={getLogo(teamBLogo)} style={styles.teamLogo} />
        <Text style={styles.teamName}>{teamBName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryColor,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  pointsContainer: {
    width: "15%", // Smaller width for points section
    alignItems: "center",
  },
  motmContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4, // Spacing between star and text
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.whiteColor,
  },
  teamContainer: {
    alignItems: "center",
    width: "27.5%", // Adjusted to balance with smaller points section
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "contain",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.whiteColor,
    textAlign: "center",
  },
  matchDetails: {
    alignItems: "center",
    width: "30%", // Center section remains slightly larger
  },
  date: {
    fontSize: 12,
    color: Colors.whiteColor,
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.whiteColor,
  },
});

export default PlayerMatchEntry;
