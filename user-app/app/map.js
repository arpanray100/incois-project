import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Linking, useColorScheme } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const BACKEND_URL = "http://10.95.199.220:5000"; // your backend IP

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      });
    })();
  }, []);

  // Fetch shelter/NGO locations
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/locations`)
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !userLocation) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // Function to open Google Maps directions
  const openDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}>
      {/* Map showing only user location */}
      <View style={{ height: 300 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={userLocation}
          showsUserLocation
        >
          <Marker
            coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            title="You are here"
            pinColor="red"
          />
        </MapView>
      </View>

      {/* List of shelters/NGOs with directions */}
      <View style={{ padding: 10 }}>
        <Text style={[styles.heading, { color: isDark ? "#fff" : "#000" }]}>Nearby Shelters & NGOs</Text>
        {locations.map(loc => (
          <View
            key={loc._id}
            style={[styles.locationCard, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}
          >
            <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>{loc.name}</Text>
            <Text style={{ color: isDark ? "#ccc" : "#333" }}>Type: {loc.type}</Text>
            <Text style={{ color: isDark ? "#ccc" : "#333" }}>Address: {loc.address}</Text>
            <Text
              style={styles.directions}
              onPress={() => openDirections(loc.latitude, loc.longitude)}
            >
              🗺️ Get Directions
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  locationCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  name: { fontSize: 16, fontWeight: "600" },
  directions: {
    color: "#007bff",
    marginTop: 5,
    fontWeight: "500"
  }
});
