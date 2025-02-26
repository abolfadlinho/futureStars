import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { RootStackParamList, Stage } from "@/constants/Types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import Header from "@/components/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import FirebaseAPI from "@/firebase/endpoints";
import getLogo from "@/constants/Logos";
import StageEntry from "@/components/Stage";

type TournamentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Tournament"
>;

type RouteParams = {
  id: string;
  name: string;
  champion: string;
  season: string;
  sport: string;
  teamsType: string;
  notes: string;
};

const Tournament = () => {
  const navigation = useNavigation<TournamentScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const route = useRoute(); // Get route object
  const { id, name, champion, season, sport, teamsType, notes } =
    route.params as RouteParams;

  const [championName, setChampionName] = useState("");
  const [championLogo, setChampionLogo] = useState("");
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const fetchChampion = async () => {
      try {
        const club = await FirebaseAPI.getChampion(champion);
        setChampionName(club.name);
        setChampionLogo(club.logo);
      } catch (error) {
        console.error("Error fetching champion:", error);
      }
    };
    const getStages = async () => {
      try {
        const stages = await FirebaseAPI.getTournamentPage(id);
        setStages(stages);
      } catch (error) {
        console.error("Error fetching stages:", error);
      } finally {
        setLoading(false);
      }
    };
    getStages();
    fetchChampion();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header name={name + " - " + teamsType} sub={sport} cup={true} />
      <View style={styles.body}>
        {champion && (
          <View style={styles.championCard}>
            <Text style={styles.championTitle}>{season} Champions</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "50%",
              }}
            >
              <View style={styles.championContainer}>
                <Image
                  source={getLogo(championLogo || "Unknown")}
                  style={styles.clubLogo}
                />
              </View>
              <Text style={styles.championName}>{championName}</Text>
              <Text> </Text>
            </View>
          </View>
        )}
        <View style={styles.notesCard}>
          <Text>{notes}</Text>
        </View>
        {!loading &&
          stages.map((stage, index) => (
            <StageEntry
              stageId={stage.stageId}
              name={stage.name}
              matches={stage.matches || []}
              group={stage.group}
              tables={stage.tables ? stage.tables : []}
              notes={stage.notes}
              key={index}
            />
          ))}
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
    backgroundColor: Colors.whiteColor,
  },
  bodyText: {
    fontSize: 18,
    color: "#333",
  },
  championCard: {
    backgroundColor: Colors.primaryColor,
    padding: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  notesCard: {
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    marginTop: 10,
  },
  championTitle: {
    fontSize: 14,
    color: Colors.secondaryColor,
    fontStyle: "italic",
  },
  championName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.whiteColor,
  },
  championContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4, // Spacing between star and text
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 10,
    alignSelf: "center",
    resizeMode: "contain",
  },
});

export default Tournament;
