import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Colors from "../constants/Colors"; // Adjust path as needed
import { Match, RootStackParamList } from "@/constants/Types";
import MatchEntry from "./MatchEntry";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import InfoModal from "./InfoModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

type MatchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Match"
>;

interface StageEntryProps {
  stageId: string;
  name: string;
  matches: Match[];
  tables: {
    name: string;
    table: {
      teamId: string;
      points: number;
      clubName?: string;
      clubLogo?: string;
    }[];
  }[];
  group: boolean; // false = knockouts
  notes: string;
}

const StageEntry: React.FC<StageEntryProps> = ({
  stageId,
  name,
  matches,
  tables,
  group,
  notes,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Matches");

  const navigation = useNavigation<MatchScreenNavigationProp>();

  const renderTabs = () => {
    switch (activeTab) {
      case "Standings":
        return (
          <FlatList
            style={{ maxHeight: 250 }}
            data={tables}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.tableContainer}>
                <Text style={styles.tableTitle}>{item.name}</Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.headerText]}>Team</Text>
                  <Text style={[styles.cell, styles.headerText]}>Points</Text>
                </View>

                {item.table.map((team) => (
                  <View key={team.teamId} style={styles.row}>
                    <Text style={styles.cell}>{team.clubName}</Text>
                    <Text style={styles.cell}>{team.points}</Text>
                  </View>
                ))}
              </View>
            )}
            nestedScrollEnabled={true}
            scrollEnabled={true}
          />
        );
        break;
      case "Matches":
        return (
          <FlatList
            style={{ maxHeight: 250 }}
            data={matches}
            keyExtractor={(item) => item.matchId}
            renderItem={({ item }) => (
              <MatchEntry
                teamAName={item.teamAName || "Unknown"}
                teamBName={item.teamBName || "Unknown"}
                teamALogo={item.teamALogo || "Unknown"}
                teamBLogo={item.teamBLogo || "Unknown"}
                finalScore={item.finalScore}
                date={item.date}
                key={item.matchId}
                onPress={() => {
                  handleMatchNavigate(
                    item.matchId,
                    item.teamAName || "Unknown",
                    item.teamBName || "Unknown",
                    item.teamAId,
                    item.teamBId,
                    item.teamALogo || "Unknown",
                    item.teamBLogo || "Unknown",
                    item.finalScore,
                    item.players,
                    item.date,
                    item.location,
                    item.motm,
                    item.stageId
                  );
                }}
              />
            )}
            nestedScrollEnabled={true}
            scrollEnabled={true}
          />
        );
        break;
    }
  };

  const handleMatchNavigate = (
    matchId: string,
    teamAName: string,
    teamBName: string,
    teamAId: string,
    teamBId: string,
    teamALogo: string,
    teamBLogo: string,
    finalScore: { A: number; B: number },
    players: {
      A: { playerId: string; points: number }[];
      B: { playerId: string; points: number }[];
    },
    date: string,
    location: string,
    motm: string,
    stageId: string
  ) => {
    navigation.navigate("Match", {
      id: matchId,
      teamAName,
      teamBName,
      teamAId,
      teamBId,
      teamALogo,
      teamBLogo,
      finalScore,
      players,
      date,
      location,
      motm,
      stageId,
    }); // Pass the clubId to the Club screen
  };

  const onCloseInfoModal = () => {
    setInfoVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded(!expanded)}
        >
          <TouchableOpacity
            onPress={() => {
              setInfoVisible(true);
            }}
          >
            <Icon name="information" size={24} color={Colors.whiteColor} />
          </TouchableOpacity>
          <Text style={styles.stageName}>{name}</Text>
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"} // Dynamic icon
            size={24}
            color={Colors.whiteColor}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.matchesContainer}>
            {!group &&
              matches.map((match) => (
                <MatchEntry
                  teamAName={match.teamAName || "Unknown"}
                  teamBName={match.teamBName || "Unknown"}
                  teamALogo={match.teamALogo || "Unknown"}
                  teamBLogo={match.teamBLogo || "Unknown"}
                  finalScore={match.finalScore}
                  date={match.date}
                  key={match.matchId}
                  onPress={() => {
                    handleMatchNavigate(
                      match.matchId,
                      match.teamAName || "Unknown",
                      match.teamBName || "Unknown",
                      match.teamAId,
                      match.teamBId,
                      match.teamALogo || "Unknown",
                      match.teamBLogo || "Unknown",
                      match.finalScore,
                      match.players,
                      match.date,
                      match.location,
                      match.motm,
                      match.stageId
                    );
                  }}
                />
              ))}
            {group && (
              <>
                <View style={styles.tabsContainer}>
                  {["Matches", "Standings"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tab,
                        activeTab === tab && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === tab && styles.activeTabText,
                        ]}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {renderTabs()}
              </>
            )}
          </View>
        )}
      </View>
      <InfoModal
        visible={infoVisible}
        onClose={onCloseInfoModal}
        content={notes}
        title={name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: Colors.primaryColor,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  stageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.whiteColor,
  },
  matchesContainer: {
    marginTop: 10,
  },
  groupText: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.whiteColor,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: Colors.whiteColor,
  },
  activeTab: {
    borderBottomColor: Colors.secondaryColor,
  },
  tabText: {
    fontSize: 16,
    color: Colors.whiteColor,
    borderBottomColor: Colors.whiteColor,
  },
  activeTabText: {
    color: Colors.secondaryColor,
    fontWeight: "bold",
  },
  tableContainer: {
    backgroundColor: Colors.whiteColor,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.primaryColor,
    paddingVertical: 5,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 5,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  headerText: {
    color: Colors.whiteColor,
    fontWeight: "bold",
  },
});

export default StageEntry;
