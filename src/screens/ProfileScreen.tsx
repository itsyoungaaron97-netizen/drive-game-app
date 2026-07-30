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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    (async () => {
      try {
        const [p, t] = await Promise.all([
          getUserProfile(user.uid),
          getUserTrips(user.uid, 10),
        ]);
        setProfile(p);
        setTrips(t);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 80,
        paddingHorizontal: spacing.md,
      }}
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>
          {profile?.displayName || "Driver"}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>

        <Text style={styles.stat}>
          Total km: {(profile?.totalKm || 0).toFixed(1)}
        </Text>
        <Text style={styles.stat}>
          Trips: {profile?.totalTrips || 0}
        </Text>
        <Text style={styles.stat}>
          Max speed: {profile?.maxSpeed || 0} km/h
        </Text>
      </View>

      <Text style={styles.section}>Recent Drives</Text>

      {trips.length === 0 ? (
        <Text style={styles.empty}>No drives yet. Go drive!</Text>
      ) : (
        trips.map((trip) => (
          <View key={trip.id} style={styles.trip}>
            <Text style={styles.tripTitle}>
              {trip.distanceKm.toFixed(2)} km
            </Text>
            <Text style={styles.text}>
              {trip.city || "Unknown"} • max {trip.maxSpeedKmh} km/h
            </Text>
            <Text style={styles.date}>
              {format(new Date(trip.startedAt), "MMM d yyyy HH:mm")}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  stat: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  trip: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tripTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  text: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  logout: {
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
