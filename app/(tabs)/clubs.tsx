import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import FirebaseAPI from "@/firebase/endpoints";
import { Club, RootStackParamList } from "@/constants/Types";
import { StackNavigationProp } from "@react-navigation/stack";
import getLogo from "@/constants/Logos";

// Define navigation prop
type ClubsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Clubs"
>;

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<ClubsScreenNavigationProp>();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubs = await FirebaseAPI.getClubs();
        setClubs(clubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleClubPress = (
    clubId: string,
    clubName: string,
    clubLogo: string,
    desc: string,
    city: string
  ) => {
    navigation.navigate("Club", {
      id: clubId,
      name: clubName,
      logo: clubLogo,
      desc,
      city,
    }); // Pass the clubId to the Club screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Clubs</Text>
      </View>
      <View style={styles.body}>
        {!loading && (
          <FlatList
            data={clubs}
            keyExtractor={(item) => item.clubId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  handleClubPress(
                    item.clubId,
                    item.name,
                    item.logo,
                    item.desc,
                    item.city
                  )
                }
                style={styles.clubCard}
              >
                <Image source={getLogo(item.logo)} style={styles.clubLogo} />
                <Text style={styles.clubName}>{item.name}</Text>
                <Text style={styles.clubCity}>{item.city}</Text>
              </TouchableOpacity>
            )}
            numColumns={2} // Display 3 items per row
            columnWrapperStyle={styles.row} // Ensure spacing between columns
          />
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
  row: {
    justifyContent: "space-between",
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
  clubCard: {
    width: "48%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 5,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "space-between",
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
    color: "#666",
    textAlign: "center",
  },
});

export default Clubs;
