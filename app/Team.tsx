import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import FirebaseAPI from "@/firebase/endpoints";
import { useRoute } from "@react-navigation/native"; // Import useRoute hook
import {
  RootStackParamList,
  Club,
  Team,
  Player,
  TeamMatch,
} from "@/constants/Types"; // Adjust this import if necessary
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Header from "@/components/Header";
import PlayerEntry from "@/components/PlayerEntry";
import MatchEntry from "@/components/MatchEntry";

type TeamScreenNavigationProp = StackNavigationProp<RootStackParamList, "Team">;

type RouteParams = {
  id: string;
  clubName: string;
  logo: string;
  teamFullName: string;
};

const TeamPage = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<TeamMatch[]>([]);
  const [header, setHeader] = useState("Team Profile");
  const [activeTab, setActiveTab] = useState("Matches");

  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { id, clubName, logo, teamFullName } = route.params as RouteParams;
  const navigation = useNavigation<TeamScreenNavigationProp>();

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const teamData = await FirebaseAPI.getTeam(id);
        if (teamData) {
          setTeam(teamData.team);
          setPlayers(teamData.players);
          setMatches(teamData.matches);
          if (team?.rank === "A") {
            setHeader(clubName + " " + team?.type);
          } else {
            setHeader(clubName + " " + team?.type + " - " + team?.rank);
          }
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamDetails();
  }, [id, loading]);

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
      sport: team?.sport || "Football",
    });
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

  const renderTabs = () => {
    switch (activeTab) {
      case "Players":
        return players.length > 0 ? (
          <FlatList
            data={players}
            keyExtractor={(item) => item.playerId}
            renderItem={({ item }) => (
              <PlayerEntry
                name={item.name}
                number={item.number}
                dob={item.dob}
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
        ) : (
          <Text>No players available</Text>
        );
      case "Matches":
        return matches.length > 0 ? (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.matchId}
            renderItem={({ item }) => (
              <>
                {item.isTeamA && (
                  <MatchEntry
                    teamAName={clubName}
                    teamALogo={logo}
                    teamBName={item.opponentName}
                    teamBLogo={item.opponentLogo}
                    finalScore={item.finalScore}
                    date={item.date}
                    onPress={() =>
                      handleMatchNavigate(
                        item.matchId,
                        clubName,
                        item.opponentName,
                        id,
                        item.opponentId,
                        logo,
                        item.opponentLogo,
                        item.finalScore,
                        item.players,
                        item.date,
                        item.location,
                        item.motm,
                        item.stageId
                      )
                    }
                  />
                )}
                {!item.isTeamA && (
                  <MatchEntry
                    teamBName={clubName}
                    teamBLogo={logo}
                    teamAName={item.opponentName}
                    teamALogo={item.opponentLogo}
                    finalScore={item.finalScore}
                    date={item.date}
                    onPress={() =>
                      handleMatchNavigate(
                        item.matchId,
                        item.opponentName,
                        clubName,
                        item.opponentId,
                        id,
                        item.opponentLogo,
                        logo,
                        item.finalScore,
                        item.players,
                        item.date,
                        item.location,
                        item.motm,
                        item.stageId
                      )
                    }
                  />
                )}
              </>
            )}
          />
        ) : (
          <Text>No matches available</Text>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header name={teamFullName} logo={logo} sub={team?.sport} />
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.secondaryColor} />
        ) : (
          <>
            <View style={styles.tabsContainer}>
              {["Matches", "Players"].map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[styles.tab, activeTab === sport && styles.activeTab]}
                  onPress={() => setActiveTab(sport)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === sport && styles.activeTabText,
                    ]}
                  >
                    {sport}
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
    paddingBottom: 0,
    backgroundColor: Colors.whiteColor,
    marginBottom: 30,
    //justifyContent: "center",
    alignItems: "center",
  },
  clubCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
    resizeMode: "contain",
  },
  clubName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryColor,
    textAlign: "center",
    marginBottom: 5,
  },
  clubCity: {
    fontSize: 16,
    color: Colors.secondaryColor,
    textAlign: "center",
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
  teamCard: {
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: Colors.whiteColor,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamName: {
    fontSize: 16,
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
});

export default TeamPage;
