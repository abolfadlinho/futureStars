import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/Colors"; // Adjust path as needed
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import getLogo from "@/constants/Logos";

interface HeaderProps {
  name: string;
  logo?: string; // URL of the logo
  sub?: string;
  cup?: boolean;
}

const Header: React.FC<HeaderProps> = ({ name, logo, sub, cup }) => {
  const navigation = useNavigation();
  const router = useRouter();

  const handleHomePress = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.header}>
      <HeaderBackButton
        onPress={() => navigation.goBack()}
        tintColor={Colors.secondaryColor}
        style={styles.backButton}
      />
      {logo && <Image source={getLogo(logo)} style={styles.clubLogo} />}
      {cup && (
        <IconSymbol
          size={50}
          name="trophy.fill"
          color={Colors.secondaryColor}
        />
      )}
      <Text style={styles.headerText}>{name}</Text>
      {sub && <Text style={styles.clubsub}>{sub}</Text>}
      <TouchableOpacity onPress={handleHomePress} style={styles.homeButton}>
        <IconSymbol size={28} name="house.fill" color={Colors.secondaryColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: Colors.primaryColor,
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 15,
  },
  homeButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "contain",
  },
  clubsub: {
    fontSize: 16,
    color: Colors.secondaryColor,
    textAlign: "center",
  },
});

export default Header;
