// app/report-hazard.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function ReportHazard() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const [hazardType, setHazardType] = useState("flood");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [media, setMedia] = useState([]);

  // 🆕 Victim details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Get current location
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Cannot access location");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      address: `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`,
    });
  };

  // Pick image/video
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setMedia([...media, { uri: asset.uri, type: asset.type }]);
      }
    } catch (error) {
      console.log("ImagePicker error:", error);
    }
  };

  // Take photo/video
  const takePhotoOrVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setMedia([...media, { uri: asset.uri, type: asset.type }]);
      }
    } catch (error) {
      console.log("Camera error:", error);
    }
  };

  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type !== "cancel") {
        setMedia([...media, { uri: result.uri, name: result.name, type: "doc" }]);
      }
    } catch (error) {
      console.log("DocumentPicker error:", error);
    }
  };

  // Submit hazard
  const handleSubmit = async () => {
    if (!description || !hazardType || !name || !phone) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("type", hazardType);
    formData.append("description", description);
    formData.append("name", name);
    formData.append("phone", phone);
    if (location) formData.append("location", JSON.stringify(location));

    media.forEach((file) => {
      let mimeType = "application/octet-stream";
      if (file.type === "image") mimeType = "image/jpeg";
      else if (file.type === "video") mimeType = "video/mp4";
      else if (file.type === "doc") mimeType = "application/pdf";

      const name = file.name || file.uri.split("/").pop();
      formData.append("media", {
        uri: file.uri.startsWith("file://") ? file.uri : "file://" + file.uri,
        name,
        type: mimeType,
      });
    });

    try {
      const res = await fetch("http://10.95.199.220:5000/api/hazards", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit hazard");
      const data = await res.json();
      console.log("Submitted hazard:", data);
      Alert.alert("Success", "Hazard submitted ✅");
      router.back();
    } catch (error) {
      console.log("Error submitting hazard:", error);
      Alert.alert("Error", "Failed to submit hazard. Check network or backend.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Report Hazard</Text>

      {/* 🆕 Name Input */}
      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Your Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000" }]}
        placeholder="Enter your name"
        placeholderTextColor={isDark ? "#888" : "#666"}
        value={name}
        onChangeText={setName}
      />

      {/* 🆕 Phone Input */}
      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Phone Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000" }]}
        placeholder="Enter your phone number"
        placeholderTextColor={isDark ? "#888" : "#666"}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Hazard Type</Text>
      <View style={[styles.pickerContainer, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
        <Picker
          selectedValue={hazardType}
          onValueChange={(itemValue) => setHazardType(itemValue)}
          style={{ color: isDark ? "#fff" : "#000" }}
        >
          <Picker.Item label="Tsunami" value="tsunami" />
          <Picker.Item label="Storm Surge" value="storm surge" />
          <Picker.Item label="High Waves" value="high waves" />
          <Picker.Item label="Swell Surge" value="swell surge" />
          <Picker.Item label="Flood" value="flood" />
          <Picker.Item label="Flooding" value="flooding" />
          <Picker.Item label="Earthquake" value="earthquake" />
          <Picker.Item label="Fire" value="fire" />
          <Picker.Item label="Cyclone" value="cyclone" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Description</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000" }]}
        placeholder="Describe the hazard..."
        placeholderTextColor={isDark ? "#888" : "#666"}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Text style={styles.buttonText}>📍 Use Current Location</Text>
      </TouchableOpacity>
      {location && <Text style={{ color: isDark ? "#ccc" : "#333", marginBottom: 10 }}>{location.address}</Text>}

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Upload Media</Text>
      <View style={styles.mediaButtons}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhotoOrVideo}>
          <Text style={styles.buttonText}>📷 Take Photo/Video</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>📄 Pick Document</Text>
      </TouchableOpacity>

      <View style={styles.mediaPreview}>
        {media.map((file, idx) => (
          <View key={idx} style={{ margin: 5 }}>
            {file.type === "image" || file.type === "video" ? (
              <Image source={{ uri: file.uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
            ) : (
              <Text style={{ color: isDark ? "#ccc" : "#333" }}>{file.name}</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#007bff" }]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>🚀 Submit Hazard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, marginBottom: 8, marginTop: 12 },
  input: { borderRadius: 8, padding: 12, minHeight: 50, textAlignVertical: "top" },
  pickerContainer: { borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#444", padding: 12, borderRadius: 8, marginVertical: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  mediaButtons: { flexDirection: "row", justifyContent: "space-between" },
  mediaPreview: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
});
