import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors"; // Adjust path as needed
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import getLogo from "@/constants/Logos";

interface MatchHeaderProps {
  teamAName: string;
  teamALogo: string;
  teamBName: string;
  teamBLogo: string;
  finalScore: { A: number; B: number };
  date: string;
  location: string;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({
  teamAName,
  teamALogo,
  teamBName,
  teamBLogo,
  finalScore,
  date,
  location,
}) => {
  const navigation = useNavigation();
  const router = useRouter();

  const handleHomePress = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.backButtonContainer}>
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          tintColor={Colors.secondaryColor}
        />
      </View>

      {/* Main Header Section */}
      <View style={styles.header}>
        {/* Team A Section (Left) */}
        <View style={styles.teamSection}>
          <Image source={getLogo(teamALogo)} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teamAName}</Text>
        </View>

        {/* Match Details Section (Center) */}
        <View style={styles.matchDetails}>
          <Text style={styles.detailText}>
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
            <Text style={styles.scoreText}>
              {finalScore.A} - {finalScore.B}
            </Text>
          )}
          {!finalScore && (
            <Text style={styles.scoreText}>{date.substring(11, 16)}</Text>
          )}
          <Text style={styles.detailText}>{location}</Text>
        </View>

        {/* Team B Section (Right) */}
        <View style={styles.teamSection}>
          <Image source={getLogo(teamBLogo)} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teamBName}</Text>
        </View>

        <View style={styles.homeButton}>
          <TouchableOpacity onPress={handleHomePress}>
            <IconSymbol
              size={28}
              name="house.fill"
              color={Colors.secondaryColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.primaryColor,
    paddingBottom: 10,
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10, // Ensures it stays above other elements
  },
  homeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40, // Space for the back button
  },
  teamSection: {
    alignItems: "center",
    width: "30%", // Ensures equal width for both teams
  },
  teamLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
    resizeMode: "contain",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.whiteColor,
    textAlign: "center",
    maxWidth: 100, // Prevents long names from breaking layout
  },
  matchDetails: {
    alignItems: "center",
    width: "40%", // Center section takes more space
  },
  scoreText: {
    fontSize: 34,
    fontWeight: "bold",
    color: Colors.whiteColor,
    textAlign: "center",
  },
  detailText: {
    fontSize: 14,
    color: Colors.whiteColor,
    textAlign: "center",
  },
});

export default MatchHeader;
