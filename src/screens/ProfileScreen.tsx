import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  logout,
  getUserProfile,
  getUserTrips,
  auth,
} from "../services/firebase";

import { UserProfile, Trip } from "../types";
import { colors, spacing } from "../constants/theme";
import { format } from "date-fns";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [trips, setTrips] =
    useState<Trip[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    (async () => {
      const [p, t] =
        await Promise.all([
          getUserProfile(user.uid),
          getUserTrips(user.uid, 10),
        ]);

      setProfile(p);
      setTrips(t);
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop:
          insets.top + spacing.md,
        paddingBottom:
          insets.bottom + 80,
        paddingHorizontal:
          spacing.md,
      }}
    >
      <Text style={styles.title}>
        Profile
      </Text>

      <View style={styles.card}>
        <Text style={styles.name}>
          {profile?.displayName || "Driver"}
        </Text>

        <Text style={styles.email}>
          {profile?.email}
        </Text>

        <Text style={styles.stat}>
          Total km: {profile?.totalKm || 0}
        </Text>

        <Text style={styles.stat}>
          Trips: {profile?.totalTrips || 0}
        </Text>

        <Text style={styles.stat}>
          Max speed: {profile?.maxSpeed || 0} km/h
        </Text>
      </View>

      <Text style={styles.section}>
        Recent Drives
      </Text>

      {trips.map((trip) => (
        <View
          key={trip.id}
          style={styles.trip}
        >
          <Text style={styles.tripTitle}>
            {trip.distanceKm.toFixed(2)} km
          </Text>

          <Text style={styles.text}>
            {trip.city || "Unknown"} • max{" "}
            {trip.maxSpeedKmh} km/h
          </Text>

          <Text style={styles.date}>
            {format(
              new Date(trip.startedAt),
              "MMM d yyyy HH:mm"
            )}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logout
