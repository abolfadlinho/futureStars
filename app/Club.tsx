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
import { RootStackParamList, Club, Team } from "@/constants/Types"; // Adjust this import if necessary
import { useNavigation } from "@react-navigation/native";
import FormIndicator from "@/components/FormIndicator";
import { StackNavigationProp } from "@react-navigation/stack";
import Header from "@/components/Header";

type ClubScreenNavigationProp = StackNavigationProp<RootStackParamList, "Club">;

type RouteParams = {
  id: string;
  name: string;
  logo: string;
  desc: string;
  city: string;
};

const ClubPage = () => {
  const navigation = useNavigation<ClubScreenNavigationProp>();

  const [club, setClub] = useState<Club | null>(null);
  const [handballTeams, setHandballTeams] = useState<Team[]>([]);
  const [footballTeams, setFootballTeams] = useState<Team[]>([]);
  const [basketballTeams, setBasketballTeams] = useState<Team[]>([]);
  const [volleyballTeams, setVolleyballTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState("Football");

  const [loading, setLoading] = useState(true);
  const route = useRoute(); // Get route object
  const { id, name, logo, desc, city } = route.params as RouteParams; // Extract the clubId from route params

  //TODO club trophies

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const clubData = await FirebaseAPI.getClub(id); // Fetch the club data by its id
        if (clubData) {
          setHandballTeams(
            clubData.handballTeams.map((team: any) => ({
              teamId: team.teamId,
              form: team.form,
              clubId: team.clubId || "",
              sport: team.sport || "",
              type: team.type || "",
              playerIds: team.playerIds || [],
              rank: team.rank || 0,
            }))
          );
          setFootballTeams(
            clubData.footballTeams.map((team: any) => ({
              teamId: team.teamId,
              form: team.form,
              clubId: team.clubId || "",
              sport: team.sport || "",
              type: team.type || "",
              playerIds: team.playerIds || [],
              rank: team.rank || 0,
            }))
          );
          setBasketballTeams(
            clubData.basketballTeams.map((team: any) => ({
              teamId: team.teamId,
              form: team.form,
              clubId: team.clubId || "",
              sport: team.sport || "",
              type: team.type || "",
              playerIds: team.playerIds || [],
              rank: team.rank || 0,
            }))
          );
          setVolleyballTeams(
            clubData.volleyballTeams.map((team: any) => ({
              teamId: team.teamId,
              form: team.form,
              clubId: team.clubId || "",
              sport: team.sport || "",
              type: team.type || "",
              playerIds: team.playerIds || [],
              rank: team.rank || 0,
            }))
          );
        }
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching club details:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchClubDetails();
  }, [id, loading]);

  const handleTeamPress = (teamId: string, type: string, rank: string) => {
    navigation.navigate("Team", {
      id: teamId,
      clubName: name || "",
      teamFullName: name + " " + rank,
      logo: logo || "",
    });
  };

  const renderTeams = () => {
    let teams: Team[] = [];
    switch (activeTab) {
      case "Handball":
        teams = handballTeams;
        break;
      case "Football":
        teams = footballTeams;
        break;
      case "Basketball":
        teams = basketballTeams;
        break;
      case "Volleyball":
        teams = volleyballTeams;
        break;
      default:
        teams = [];
    }

    return (
      <FlatList
        data={teams}
        keyExtractor={(item) => item.teamId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teamCard}
            onPress={() =>
              handleTeamPress(
                item.teamId,
                item.type,
                item.rank === "A" ? item.type : item.type + " - " + item.rank
              )
            }
          >
            <Text style={styles.teamName}>
              {item.rank === "A" ? item.type : item.type + " - " + item.rank}
            </Text>
            {item.form && Array.isArray(item.form) && (
              <FormIndicator results={item.form as ("W" | "D" | "L" | "U")[]} />
            )}
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header name={name} logo={logo} sub={city} />
      <View style={styles.body}>
        <View style={styles.clubCard}>
          <Text>{desc}</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.secondaryColor}
              style={{ margin: 20 }}
            />
          ) : (
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
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.whiteColor,
    marginBottom: 30,
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
});

export default ClubPage;
