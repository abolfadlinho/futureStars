import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, PlayerMatch } from "@/constants/Types";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import FirebaseAPI from "@/firebase/endpoints";
import Header from "@/components/Header";
import PlayerMatchEntry from "@/components/PlayerMatchEntry";
import Ionicons from "react-native-vector-icons/Ionicons";

type TeamScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Player"
>;

type RouteParams = {
  id: string;
  name: string;
  age: string;
  number: number;
  sport: string;
};

const PlayerPage = () => {
  const route = useRoute();
  const { id, name, age, number } = route.params as RouteParams;
  const navigation = useNavigation<TeamScreenNavigationProp>();
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const playerMatches = await FirebaseAPI.getAllPlayerMatches(id);
        setMatches(playerMatches);
      } catch (error) {
        console.error("Error fetching player matches: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <Header name={name} sub={age} />
      <View style={styles.body}>
        <View style={styles.jerseyContainer}>
          <Ionicons name="shirt" size={80} color={Colors.primaryColor} />
          <Text style={styles.jerseyNumber}>{number}</Text>
        </View>
        {loading && (
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        )}
        {!loading && matches.length === 0 && (
          <Text style={styles.noMatches}>No matches found</Text>
        )}
        <FlatList
          data={matches}
          keyExtractor={(item) => item.matchId + item.opponentName}
          renderItem={({ item }) => (
            <PlayerMatchEntry
              teamBName={item.opponentName}
              teamBLogo={item.opponentLogo}
              teamAName={item.playerTeamName}
              teamALogo={item.playerTeamLogo}
              finalScore={item.finalScore}
              date={item.date}
              isMotm={item.isMotm ? item.isMotm : false}
              points={item.points ? item.points : 0}
            />
          )}
        />
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
  },
  jerseyContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  jerseyNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.secondaryColor,
    position: "absolute", // Puts the number on top of the shirt icon
  },
  noMatches: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
  matchCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryColor,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  separator: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginHorizontal: 5,
  },
});

export default PlayerPage;
