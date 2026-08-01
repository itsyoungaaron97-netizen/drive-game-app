import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { WebView } from "react-native-webview";
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

  const webRef = useRef<WebView>(null);
  const watchSub = useRef<any>(null);
  const startTime = useRef(0);

  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<TripPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const ok = await requestLocationPermissions();

      if (!ok) {
        Alert.alert("Location needed", "Please allow location access.");
        return;
      }

      const pos = await getCurrentPosition();

      if (pos) {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        setLocation(loc);

        webRef.current?.postMessage(
          JSON.stringify({
            type: "location",
            ...loc,
          })
        );
      }
    })();

    return () => {
      watchSub.current?.remove();
    };
  }, []);

  const sendRouteToMap = (route: TripPoint[]) => {
    webRef.current?.postMessage(
      JSON.stringify({
        type: "route",
        points: route,
      })
    );
  };

  const startDrive = useCallback(async () => {
    setPoints([]);
    setDistanceKm(0);
    setSpeed(0);

    startTime.current = Date.now();
    setIsTracking(true);

    watchSub.current = await watchPosition((point) => {
      setPoints((old) => {
        const updated = [...old, point];
        setDistanceKm(calculateDistanceKm(updated));
        sendRouteToMap(updated);
        return updated;
      });

      if (point.speed !== undefined && point.speed !== null) {
        setSpeed(Math.round(point.speed * 3.6));
      }

      setLocation({
        latitude: point.latitude,
        longitude: point.longitude,
      });
    });
  }, []);

  const stopDrive = async () => {
    watchSub.current?.remove();
    watchSub.current = null;
    setIsTracking(false);

    if (points.length < 2) {
      Alert.alert("Drive too short", "Drive longer before saving.");
      return;
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime.current) / 1000);
    const maxSpeed = calculateMaxSpeedKmh(points);
    const avgSpeed = calculateAvgSpeedKmh(distanceKm, duration);

    const user = auth.currentUser;
    if (!user) return;

    const place = await reverseGeocode(
      points[0].latitude,
      points[0].longitude
    );

    try {
      await saveTrip({
        userId: user.uid,
        userDisplayName: user.displayName || "Driver",
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

      // This now returns XP info
      const result = await updateUserStats(user.uid, distanceKm, maxSpeed);

      Alert.alert(
        "Drive saved!",
        `${distanceKm.toFixed(2)} km • max \( {maxSpeed} km/h\n+ \){result.xpGained} XP  |  Level ${result.newLevel}`
      );
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save drive");
    }

    setPoints([]);
    setDistanceKm(0);
    setSpeed(0);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
<style>
html,body,#map{height:100%;margin:0;padding:0;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script>
const map = L.map('map').setView([0,0],15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
let marker;
let line = L.polyline([]).addTo(map);

document.addEventListener("message", function(event){
  const data = JSON.parse(event.data);

  if(data.type==="location"){
    map.setView([data.latitude,data.longitude],15);
    if(marker) map.removeLayer(marker);
    marker = L.marker([data.latitude,data.longitude]).addTo(map);
  }

  if(data.type==="route"){
    const coords = data.points.map(p => [p.latitude, p.longitude]);
    line.setLatLngs(coords);
    if(coords.length > 1) map.fitBounds(line.getBounds());
  }
});
</script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        style={styles.map}
      />

      <View style={[styles.stats, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.stat}>{distanceKm.toFixed(2)} km</Text>
        <Text style={styles.stat}>{speed} km/h</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isTracking && styles.buttonStop]}
        onPress={isTracking ? stopDrive : startDrive}
      >
        <Text style={styles.buttonText}>
          {isTracking ? "END DRIVE" : "START DRIVE"}
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
  map: {
    flex: 1,
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
  buttonStop: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: "#000",
    fontWeight: "900",
  },
});