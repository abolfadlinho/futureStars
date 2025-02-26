import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Player, Tournament } from "@/constants/Types";
import { useNavigation, useRoute } from "@react-navigation/native";
import FirebaseAPI from "@/firebase/endpoints";
import MatchHeader from "@/components/MatchHeader";
import PlayerEntry from "@/components/PlayerEntry";
import Icon from "react-native-vector-icons/FontAwesome";

type MatchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Match"
>;

type RouteParams = {
  id: string;
  teamAName: string;
  teamBName: string;
  teamALogo: string;
  teamBLogo: string;
  teamAId: string;
  teamBId: string;
  finalScore: { A: number; B: number };
  players: {
    A: { playerId: string; points: number }[];
    B: { playerId: string; points: number }[];
  };
  date: string;
  location: string;
  motm: string;
  stageId: string;
};

const Match = () => {
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("A");
  const [playersA, setPlayersA] = useState<Player[]>([]);
  const [playersB, setPlayersB] = useState<Player[]>([]);
  const [motmDetails, setMotmDetails] = useState<Player | null>(null);
  const [motmPoints, setMotmPoints] = useState(0);
  const [tournament, setTournament] = useState<Tournament | undefined>(
    undefined
  );
  const route = useRoute();
  const {
    id,
    teamAName,
    teamBName,
    teamALogo,
    teamBLogo,
    finalScore,
    players,
    date,
    location,
    motm,
    stageId,
  } = route.params as RouteParams;

  useEffect(() => {
    const fetchTournament = async (stageId: string) => {
      try {
        const tournament = await FirebaseAPI.getTournament(stageId);
        setTournament(tournament);
      } catch (error) {
        console.error("Error fetching tournament:", error);
      }
    };

    const fetchPlayerDetails = async () => {
      try {
        const playerDataA = await FirebaseAPI.getPlayers(
          players.A.map((p) => p.playerId)
        );
        const playerDataB = await FirebaseAPI.getPlayers(
          players.B.map((p) => p.playerId)
        );
        setPlayersA(playerDataA);
        setPlayersB(playerDataB);
      } catch (error) {
        console.error("Error fetching player details:", error);
      }
    };

    const fetchMotmDetails = async () => {
      try {
        const motmData = await FirebaseAPI.getPlayer(motm);
        let motmpoints =
          players.A.find((p) => p.playerId === motmData?.playerId)?.points ||
          players.B.find((p) => p.playerId === motmData?.playerId)?.points ||
          0;
        setMotmDetails(motmData);
        setMotmPoints(motmpoints);
      } catch (error) {
        console.error("Error fetching MOTM details:", error);
      }
    };

    fetchPlayerDetails();
    fetchMotmDetails();
    fetchTournament(stageId);
    setLoading(false);
  }, [id, players, motm]);

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

  const handlePlayerNavigate = (
    id: string,
    name: string,
    age: string,
    number: number
  ) => {
    navigation.navigate("Player", {
      id,
      name,
      number,
      age,
    });
  };

  const renderTabs = () => {
    switch (activeTab) {
      case "A":
        return (
          <FlatList
            data={playersA}
            keyExtractor={(item) => item.playerId}
            renderItem={({ item }) => (
              <PlayerEntry
                name={item.name}
                number={item.number}
                dob={item.dob}
                points={
                  players.A.find((p) => p.playerId === item.playerId)?.points
                }
                onPress={() => {
                  handlePlayerNavigate(
                    item.playerId,
                    item.name,
                    getAge(item.dob),
                    item.number
                  );
                }}
              />
            )}
          />
        );
        break;
      case "B":
        return (
          <FlatList
            data={playersB}
            keyExtractor={(item) => item.playerId}
            renderItem={({ item }) => (
              <PlayerEntry
                name={item.name}
                number={item.number}
                dob={item.dob}
                points={
                  players.B.find((p) => p.playerId === item.playerId)?.points
                }
                onPress={() => {
                  handlePlayerNavigate(
                    item.playerId,
                    item.name,
                    getAge(item.dob),
                    item.number
                  );
                }}
              />
            )}
          />
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MatchHeader
        teamAName={teamAName}
        teamALogo={teamALogo}
        teamBName={teamBName}
        teamBLogo={teamBLogo}
        finalScore={{ A: finalScore.A, B: finalScore.B }}
        date={date}
        location={location}
      />

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.secondaryColor} />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Icon name="trophy" size={22} color={Colors.secondaryColor} />
              {tournament?.tournamentStageString && (
                <Text style={{ marginLeft: 5 }}>
                  {tournament?.tournamentStageString}
                </Text>
              )}
            </View>
            {motmDetails && (
              <>
                <TouchableOpacity
                  style={styles.motmCard}
                  onPress={() => {
                    handlePlayerNavigate(
                      motmDetails.playerId,
                      motmDetails.name,
                      getAge(motmDetails.dob),
                      motmDetails.number
                    );
                  }}
                >
                  <Text style={styles.motmTitle}>Best Performer</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <View style={styles.motmContainer}>
                      <Icon
                        name="star"
                        size={28}
                        color={Colors.secondaryColor}
                      />
                    </View>
                    <Text style={styles.motmName}>{motmDetails.name}</Text>
                    <Text style={styles.pointsText}>{motmPoints} Pts</Text>
                  </View>
                  <Text style={styles.motmTitle}>
                    {playersA.find((p) => p.playerId === motmDetails.playerId)
                      ? teamAName
                      : teamBName}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.tabsContainer}>
              {["A", "B"].map((team) => (
                <TouchableOpacity
                  key={team}
                  style={[styles.tab, activeTab === team && styles.activeTab]}
                  onPress={() => setActiveTab(team)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === team && styles.activeTabText,
                    ]}
                  >
                    {team == "A" ? teamAName : teamBName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderTabs()}
          </>
        )}
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
    flexDirection: "row",
    padding: 20,
    backgroundColor: Colors.primaryColor,
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamBlock: {
    alignItems: "center",
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
    flexWrap: "wrap",
    maxWidth: 120, // Adjust width to control wrapping
  },
  scoreText: {
    fontSize: 34,
    fontWeight: "bold",
    color: Colors.whiteColor,
    textAlign: "center",
  },
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.whiteColor,
    marginBottom: 30,
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: Colors.secondaryColor,
    textAlign: "center",
  },
  playerPoints: {
    fontSize: 14,
    color: Colors.secondaryColor,
    textAlign: "center",
  },
  motmCard: {
    backgroundColor: Colors.primaryColor,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  motmTitle: {
    fontSize: 14,
    color: Colors.secondaryColor,
    fontStyle: "italic",
  },
  motmName: {
    fontSize: 20,
    fontWeight: "bold",
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
    borderBottomColor: Colors.secondaryColor,
  },
  activeTab: {
    borderBottomColor: Colors.primaryColor,
  },
  tabText: {
    fontSize: 16,
    color: Colors.secondaryColor,
  },
  activeTabText: {
    color: Colors.primaryColor,
    fontWeight: "bold",
  },
  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: Colors.whiteColor,
    borderBottomColor: Colors.locked,
    borderBottomWidth: 1,
    elevation: 4,
    width: "100%",
  },
  playerName: {
    fontSize: 18,
    color: Colors.primaryColor,
    fontWeight: "bold",
  },
  playerNumber: {
    fontSize: 20,
    color: Colors.secondaryColor,
    fontWeight: "bold",
    padding: 10,
    borderWidth: 1,
    borderRadius: 100,
    backgroundColor: Colors.primaryColor,
  },
  playerAge: {
    fontSize: 14,
    color: "#333",
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
});

export default Match;
