import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors"; // Adjust path as needed
import getLogo from "@/constants/Logos";

interface MatchEntryProps {
  teamAName: string;
  teamALogo: string;
  teamBName: string;
  teamBLogo: string;
  finalScore: { A: number; B: number };
  date: string;
  tournamentString?: string;
  onPress?: () => void;
}

const MatchEntry: React.FC<MatchEntryProps> = ({
  teamAName,
  teamALogo,
  teamBName,
  teamBLogo,
  finalScore,
  date,
  tournamentString,
  onPress,
}) => {
  return (
    <>
      {tournamentString && (
        <Text
          style={{
            fontSize: 12,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          {tournamentString}
        </Text>
      )}

      <TouchableOpacity style={styles.container} onPress={onPress}>
        {/* Team A */}
        <View style={styles.teamContainer}>
          <Image source={getLogo(teamALogo)} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teamAName}</Text>
        </View>

        {/* Match Details */}
        <View style={styles.matchDetails}>
          <Text style={styles.date}>
            {(() => {
              const matchDate = new Date(date.substring(0, 10));
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);

              if (matchDate.toDateString() === today.toDateString()) {
                return "Today";
              } else if (matchDate.toDateString() === tomorrow.toDateString()) {
                return "Tomorrow";
              } else if (
                matchDate.toDateString() === yesterday.toDateString()
              ) {
                return "Yesterday";
              } else {
                return date.substring(0, 10);
              }
            })()}
          </Text>
          {finalScore && (
            <Text style={styles.score}>
              {finalScore.A} - {finalScore.B}
            </Text>
          )}
          {!finalScore && (
            <Text style={styles.score}>{date.substring(11, 16)}</Text>
          )}
        </View>

        {/* Team B */}
        <View style={styles.teamContainer}>
          <Image source={getLogo(teamBLogo)} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teamBName}</Text>
        </View>
      </TouchableOpacity>
    </>
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
  teamContainer: {
    alignItems: "center",
    width: "30%",
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
    width: "40%",
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

export default MatchEntry;
