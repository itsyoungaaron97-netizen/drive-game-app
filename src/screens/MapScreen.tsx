import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import MapView, {
  Polyline,
  UrlTile,
  Region,
} from "react-native-maps";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  requestLocationPermissions,
  getCurrentPosition,
  watchPosition,
  calculateDistanceKm,
  calculateMaxSpeedKmh,
  calculateAvgSpeedKmh,
  reverseGeocode,
} from "../services/location";

import {
  saveTrip,
  updateUserStats,
  auth,
} from "../services/firebase";

import { TripPoint } from "../types";
import { colors, spacing } from "../constants/theme";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const watchSub = useRef<any>(null);

  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<TripPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [region, setRegion] = useState<Region | null>(null);

  const startTime = useRef(0);

  useEffect(() => {
    (async () => {
      const ok = await requestLocationPermissions();

      if (!ok) {
        Alert.alert(
          "Location needed",
          "Please allow location access."
        );
        return;
      }

      const pos = await getCurrentPosition();

      console.log("POSITION:", pos);

      if (pos) {
        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();

    return () => {
      watchSub.current?.remove();
    };
  }, []);

  const startDrive = useCallback(async () => {
    setPoints([]);
    setDistanceKm(0);
    setSpeed(0);

    startTime.current = Date.now();
    setIsTracking(true);

    watchSub.current = await watchPosition((point) => {
      setPoints((old) => {
        const updated = [...old, point];

        setDistanceKm(
          calculateDistanceKm(updated)
        );

        return updated;
      });

      if (point.speed) {
        setSpeed(
          Math.round(point.speed * 3.6)
        );
      }
    });
  }, []);

  const stopDrive = async () => {
    watchSub.current?.remove();
    watchSub.current = null;

    setIsTracking(false);

    if (points.length < 2) {
      Alert.alert(
        "Drive too short",
        "Drive longer before saving."
      );
      return;
    }

    const endTime = Date.now();

    const duration =
      (endTime - startTime.current) / 1000;

    const maxSpeed =
      calculateMaxSpeedKmh(points);

    const avgSpeed =
      calculateAvgSpeedKmh(
        distanceKm,
        duration
      );

    const user = auth.currentUser;

    if (!user) return;

    const place = await reverseGeocode(
      points[0].latitude,
      points[0].longitude
    );

    await saveTrip({
      userId: user.uid,
      userDisplayName:
        user.displayName || "Driver",
      startedAt: startTime.current,
      endedAt: endTime,
      distanceKm,
      durationSeconds: duration,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: maxSpeed,
      route: points,
      city: place.city,
      state: place.state,
      country: place.country,
    });

    await updateUserStats(
      user.uid,
      distanceKm,
      maxSpeed
    );

    Alert.alert(
      "Drive saved",
      `${distanceKm.toFixed(2)} km`
    );

    setPoints([]);
    setDistanceKm(0);
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Getting location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        region={region}
        showsUserLocation
        followsUserLocation={false}
      >

        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          zIndex={-1}
        />

        {points.length > 1 && (
          <Polyline
            coordinates={points.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor={colors.primary}
            strokeWidth={5}
          />
        )}

      </MapView>

      <View
        style={[
          styles.stats,
          { paddingTop: insets.top + 10 },
        ]}
      >
        <Text style={styles.stat}>
          {distanceKm.toFixed(2)} km
        </Text>

        <Text style={styles.stat}>
          {speed} km/h
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={
          isTracking ? stopDrive : startDrive
        }
      >
        <Text style={styles.buttonText}>
          {isTracking
            ? "END DRIVE"
            : "START DRIVE"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: colors.text,
  },

  stats: {
    position: "absolute",
    top: 0,
    width: "100%",
    alignItems: "center",
  },

  stat: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "bold",
  },

  button: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 15,
  },

  buttonText: {
    color: "#000",
    fontWeight: "900",
  },
});