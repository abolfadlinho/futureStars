import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  Text,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/images/futureStars.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: Colors.secondaryColor,
    fontSize: 24,
  },
  logo: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
});

export default Index;
