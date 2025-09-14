import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function HelpMeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState("choose"); // "choose", "resource", "service"
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [requestDetails, setRequestDetails] = useState("");

  // Get current location
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const coords = `${loc.coords.latitude}, ${loc.coords.longitude}`;
      setLocation(coords);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location.");
    }
  };

  const handleSubmit = async (type) => {
    try {
      const endpoint =
        type === "resource"
          ? "http://10.95.199.220:5000/api/resource-request"
          : "http://10.95.199.220:5000/api/service-request";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, requestDetails }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("✅ Success", `Your ${type} request was submitted.`);
        setName("");
        setLocation("");
        setRequestDetails("");
        setStep("choose");
      } else {
        Alert.alert("❌ Error", data.error || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    }
  };

  const themeStyles = isDark ? styles.dark : styles.light;

  if (step === "choose") {
    return (
      <LinearGradient
        colors={isDark ? ["#0f0f0f", "#1a1a1a"] : ["#E6F4FE", "#ffffff"]}
        style={styles.container}
      >
        <Animatable.View animation="fadeInDown" duration={1200}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Help Me
          </Text>
        </Animatable.View>

        <Animatable.View animation="bounceIn" delay={500}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#4CAF50" }]}
            onPress={() => setStep("resource")}
          >
            <Ionicons name="cube-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}> Request Resource</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="bounceIn" delay={800}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#2196F3" }]}
            onPress={() => setStep("service")}
          >
            <Ionicons name="build-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}> Request Service</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ["#0f0f0f", "#1a1a1a"] : ["#E6F4FE", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView>
        <Animatable.Text
          animation="fadeInDown"
          duration={1000}
          style={[styles.title, { color: isDark ? "#fff" : "#000" }]}
        >
          {step === "resource" ? "Resource Request" : "Service Request"}
        </Animatable.Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={isDark ? "#fff" : "#333"} />
          <TextInput
            placeholder="Your Name"
            placeholderTextColor={isDark ? "#aaa" : "#555"}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={isDark ? "#fff" : "#333"} />
          <TextInput
            placeholder="Location (or use Current Location)"
            placeholderTextColor={isDark ? "#aaa" : "#555"}
            value={location}
            onChangeText={setLocation}
            style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
          />
        </View>

        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: "#FF9800" }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="navigate-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}> Use Current Location</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons name="document-text-outline" size={20} color={isDark ? "#fff" : "#333"} />
          <TextInput
            placeholder="Request Details"
            placeholderTextColor={isDark ? "#aaa" : "#555"}
            value={requestDetails}
            onChangeText={setRequestDetails}
            multiline
            style={[styles.textArea, { color: isDark ? "#fff" : "#000" }]}
          />
        </View>

        <Animatable.View animation="fadeInUp" delay={400}>
          <Button
            title="Submit"
            onPress={() => handleSubmit(step)}
            color={step === "resource" ? "#4CAF50" : "#2196F3"}
          />
        </Animatable.View>

        <View style={{ marginTop: 20 }}>
          <Button title="⬅ Back" onPress={() => setStep("choose")} color="#777" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 120,
    marginBottom: 15,
  },
  button: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  smallButton: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  light: {
    backgroundColor: "#fff",
    color: "#000",
    borderColor: "#ccc",
  },
  dark: {
    backgroundColor: "#121212",
    color: "#fff",
    borderColor: "#555",
  },
});
