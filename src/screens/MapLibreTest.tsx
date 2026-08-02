import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export default function MapLibreTest() {
  const cameraRef = useRef<any>(null);

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [hasPermission, setHasPermission] =
    useState<boolean | null>(null);

  useEffect(() => {
    const loadLocation = async () => {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(current);
    };

    loadLocation();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>
          Requesting location permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Location permission is required to display the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL={MAP_STYLE}
        logoEnabled={false}
        compassEnabled={true}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          pitch={55}
          centerCoordinate={
            location
              ? [
                  location.coords.longitude,
                  location.coords.latitude,
                ]
              : [13.405, 52.52]
          }
        />

        <MapLibreGL.UserLocation visible={true} />
      </MapLibreGL.MapView>

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {location
            ? `Latitude: ${location.coords.latitude.toFixed(
                5
              )}\nLongitude: ${location.coords.longitude.toFixed(5)}`
            : "Retrieving current location..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  map: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 16,
  },

  errorText: {
    color: "#f87171",
    fontSize: 16,
    textAlign: "center",
  },

  overlay: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15,23,42,0.85)",
    padding: 12,
    borderRadius: 12,
  },

  overlayText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "monospace",
  },
});