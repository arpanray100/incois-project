import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import CustomButton from "../components/CustomButton";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/disaster-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Logo */}
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />

        <Text style={styles.subtitle}>Report hazards & help others</Text>

        <CustomButton title="Report Hazard" onPress={() => router.push("../report-hazard")} />
        <CustomButton title="View Hazards Map" onPress={() => router.push("../map")} />
        <CustomButton title="Help-Me" onPress={() => router.push("/help-me")} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // semi-dark overlay for readability
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75, // round shape (half of width/height)
    borderWidth: 3,
    borderColor: "#fff", // white border for nice effect
    resizeMode: "cover",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
