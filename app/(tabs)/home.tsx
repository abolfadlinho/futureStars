import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { MatchDetails, Match, RootStackParamList } from "@/constants/Types";
import FirebaseAPI from "@/firebase/endpoints";
import MatchEntry from "@/components/MatchEntry";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Populate from "@/firebase/population";

type TeamScreenNavigationProp = StackNavigationProp<RootStackParamList, "Team">;

const Home = () => {
  const [handballMatches, setHandballMatches] = useState<Match[]>([]);
  const [footballMatches, setFootballMatches] = useState<Match[]>([]);
  const [volleyballMatches, setVolleyballMatches] = useState<Match[]>([]);
  const [basketballMatches, setBasketballMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("Football");
  const [day, setDay] = useState(0);
  const navigation = useNavigation<TeamScreenNavigationProp>();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        let matches;
        if (day === -1) {
          matches = await FirebaseAPI.getYesterdayMatches();
        } else if (day === 1) {
          matches = await FirebaseAPI.getTomorrowMatches();
        } else {
          matches = await FirebaseAPI.getHomeMatches();
        }
        setHandballMatches(matches.handballMatches);
        setFootballMatches(matches.footballMatches);
        setBasketballMatches(matches.basketballMatches);
        setVolleyballMatches(matches.volleyballMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [day]);

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

  const handleYesterday = () => {
    setLoading(true);
    setDay(day - 1);
  };

  const handleTomorrow = () => {
    setLoading(true);
    setDay(day + 1);
  };

  const renderTeams = () => {
    let matches: Match[] = [];
    switch (activeTab) {
      case "Handball":
        matches = handballMatches;
        break;
      case "Football":
        matches = footballMatches;
        break;
      case "Basketball":
        matches = basketballMatches;
        break;
      case "Volleyball":
        matches = volleyballMatches;
        break;
      default:
        matches = [];
    }

    if (matches.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              color: Colors.greyText,
              fontStyle: "italic",
            }}
          >
            No matches{" "}
            {day === 0 ? "today" : day === -1 ? "yesterday" : "tomorrow"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId}
        renderItem={({ item }) => (
          <MatchEntry
            teamAName={item.teamAName ? item.teamAName : "Unknown Team"}
            teamALogo={item.teamALogo ? item.teamALogo : "any"}
            teamBName={item.teamBName ? item.teamBName : "Unknown Team"}
            teamBLogo={item.teamBLogo ? item.teamBLogo : "any"}
            finalScore={item.finalScore}
            tournamentString={item.tournamentString}
            date={item.date}
            onPress={() =>
              handleMatchNavigate(
                item.matchId,
                item.teamAName ? item.teamAName : "Unknown Team",
                item.teamBName ? item.teamBName : "Unknown Team",
                item.teamAId,
                item.teamBId,
                item.teamALogo ? item.teamALogo : "any",
                item.teamBLogo ? item.teamBLogo : "any",
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
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/wide.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.body}>
        <View
          style={{
            backgroundColor: Colors.primaryColor,
            padding: 10,
            borderRadius: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {day > -1 && (
            <TouchableOpacity onPress={() => handleYesterday()}>
              <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>
                ←
              </Text>
            </TouchableOpacity>
          )}
          {day <= -1 && <Text> </Text>}
          <Text
            style={{
              fontSize: 17,
              color: Colors.secondaryColor,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {day === 0
              ? "Today's Matches"
              : day === -1
              ? "Yesterday's Matches"
              : "Tomorrow's Matches"}
          </Text>
          {day < 1 && (
            <TouchableOpacity onPress={() => handleTomorrow()}>
              <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>
                →
              </Text>
            </TouchableOpacity>
          )}
          {day >= 1 && <Text> </Text>}
        </View>
        {!loading && (
          <>
            <View style={styles.tabsContainer}>
              {["Football", "Handball", "Basketball", "Volleyball"].map(
                (sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.tab,
                      activeTab === sport && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab(sport)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === sport && styles.activeTabText,
                      ]}
                    >
                      {sport === "Handball"
                        ? "🤾"
                        : sport === "Football"
                        ? "⚽"
                        : sport === "Basketball"
                        ? "🏀"
                        : sport === "Volleyball"
                        ? "🏐"
                        : "Other"}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
            {renderTeams()}
          </>
        )}
        {loading && (
          <View style={{ marginTop: "45%" }}>
            <ActivityIndicator size="large" color={Colors.secondaryColor} />
          </View>
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
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.whiteColor,
    marginBottom: 28,
  },
  logo: {
    width: 350,
    height: 50,
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
});

export default Home;
