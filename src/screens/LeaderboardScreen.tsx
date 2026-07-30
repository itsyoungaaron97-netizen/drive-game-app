import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getLeaderboard } from "../services/firebase";
import { LeaderboardEntry, LobbyScope } from "../types";
import { colors, spacing } from "../constants/theme";

const SCOPES: { key: LobbyScope; label: string }[] = [
  { key: "global", label: "Global" },
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();

  const [scope, setScope] =
    useState<LobbyScope>("global");

  const [entries, setEntries] =
    useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getLeaderboard(scope);
      setEntries(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const renderItem = ({
    item,
  }: {
    item: LeaderboardEntry;
  }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>
        #{item.rank}
      </Text>

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.displayName}
        </Text>

        <Text style={styles.meta}>
          {item.totalTrips} trips • max{" "}
          {item.maxSpeed} km/h
        </Text>
      </View>

      <Text style={styles.km}>
        {item.totalKm.toFixed(1)} km
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            insets.top + spacing.md,
        },
      ]}
    >
      <Text style={styles.title}>
        Leaderboard
      </Text>

      <View style={styles.tabs}>
        {SCOPES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[
              styles.tab,
              scope === s.key &&
                styles.active,
            ]}
            onPress={() =>
              setScope(s.key)
            }
          >
            <Text
              style={[
                styles.tabText,
                scope === s.key &&
                  styles.activeText,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) =>
            item.uid
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No drivers yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    paddingHorizontal:
      spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom:
      spacing.md,
  },

  tabs: {
    flexDirection: "row",
    marginBottom:
      spacing.md,
  },

  tab: {
    backgroundColor:
      colors.surface,
    padding: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },

  active: {
    backgroundColor:
      colors.primary,
  },

  tabText: {
    color:
      colors.textSecondary,
  },

  activeText: {
    color: "#000",
  },

  row: {
    flexDirection:
      "row",
    alignItems:
      "center",
    backgroundColor:
      colors.surface,
    padding:
      spacing.md,
    borderRadius: 12,
    marginBottom:
      spacing.sm,
  },

  rank: {
    color:
      colors.primary,
    fontWeight:
      "900",
    width: 40,
  },

  info: {
    flex: 1,
  },

  name: {
    color:
      colors.text,
    fontWeight:
      "700",
  },

  meta: {
    color:
      colors.textSecondary,
  },

  km: {
    color:
      colors.primary,
    fontWeight:
      "800",
  },

  empty: {
    color:
      colors.textSecondary,
    textAlign:
      "center",
  },
});
