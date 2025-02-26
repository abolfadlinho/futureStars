import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import FirebaseAPI from "@/firebase/endpoints";
import { Tournament, RootStackParamList } from "@/constants/Types";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome";

// Define navigation prop
type TournamentsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Tournament"
>;

const Tournaments = () => {
  const [handballTournaments, setHandballTournaments] = useState<Tournament[]>(
    []
  );
  const [footballTournaments, setFootballTournaments] = useState<Tournament[]>(
    []
  );
  const [volleyballTournaments, setVolleyballTournaments] = useState<
    Tournament[]
  >([]);
  const [basketballTournaments, setBasketballTournaments] = useState<
    Tournament[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<TournamentsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState("Football");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const ret = await FirebaseAPI.getTournaments();
        setHandballTournaments(ret.handballTournaments);
        setFootballTournaments(ret.footballTournaments);
        setBasketballTournaments(ret.basketballTournaments);
        setVolleyballTournaments(ret.volleyballTournaments);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const handleTournamentPress = (
    tournamentId: string,
    name: string,
    champion: string,
    season: string,
    notes: string,
    sport: string,
    teamsType: string
  ) => {
    navigation.navigate("Tournament", {
      id: tournamentId,
      name,
      champion,
      notes,
      season,
      sport,
      teamsType,
    });
  };

  const renderTeams = () => {
    let tournaments: Tournament[] = [];
    switch (activeTab) {
      case "Handball":
        tournaments = handballTournaments;
        break;
      case "Football":
        tournaments = footballTournaments;
        break;
      case "Basketball":
        tournaments = basketballTournaments;
        break;
      case "Volleyball":
        tournaments = volleyballTournaments;
        break;
      default:
        tournaments = [];
    }

    return (
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.tournamentId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tournamentCard}
            onPress={() => {
              handleTournamentPress(
                item.tournamentId,
                item.name,
                item.champion,
                item.season,
                item.notes,
                item.sport,
                item.teamsType
              );
            }}
          >
            <Icon name="trophy" size={50} color={Colors.secondaryColor} />
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={styles.tournamentName}>{item.name}</Text>
              <Text style={styles.teamsType}>{item.teamsType}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tournaments</Text>
      </View>
      <View style={styles.body}>
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
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    backgroundColor: Colors.whiteColor,
    marginBottom: 30,
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
  tournamentCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: Colors.primaryColor,
    borderRadius: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  tournamentName: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.whiteColor,
    textAlign: "center",
    marginHorizontal: 4,
  },
  teamsType: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.secondaryColor,
    textAlign: "center",
    justifyContent: "center",
  },
});

export default Tournaments;
