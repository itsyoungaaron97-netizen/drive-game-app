import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  auth,
  getUserProfile,
  getUserChallengeProgress,
  updateChallengeProgress,
  claimChallengeReward,
} from "../services/firebase";
import { CHALLENGES } from "../constants/challenges";
import { UserChallengeProgress, UserProfile } from "../types";
import { colors, spacing } from "../constants/theme";

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const [p, prog] = await Promise.all([
        getUserProfile(user.uid),
        getUserChallengeProgress(user.uid),
      ]);
      setProfile(p);
      setProgress(prog);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getProgressFor = (challengeId: string) => {
    return progress.find((p) => p.challengeId === challengeId);
  };

  const handleClaim = async (challengeId: string, xpReward: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const result = await claimChallengeReward(user.uid, challengeId, xpReward);
      Alert.alert("Reward claimed!", `+${xpReward} XP\nYou are now Level ${result.newLevel}`);
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not claim reward");
    }
  };

  const renderItem = ({ item }: { item: typeof CHALLENGES[0] }) => {
    const userProg = getProgressFor(item.id);
    const current = userProg?.progress || 0;
    const completed = userProg?.completed || false;
    const claimed = userProg?.claimed || false;
    const percent = Math.min((current / item.target) * 100, 100);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          {item.isDaily && <Text style={styles.daily}>DAILY</Text>}
        </View>

        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <Text style={styles.progressText}>
          {current} / {item.target}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.xp}>+{item.xpReward} XP</Text>

          {completed && !claimed ? (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => handleClaim(item.id, item.xpReward)}
            >
              <Text style={styles.claimText}>CLAIM</Text>
            </TouchableOpacity>
          ) : claimed ? (
            <Text style={styles.claimed}>Claimed</Text>
          ) : (
            <Text style={styles.locked}>In progress</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Challenges</Text>
      <Text style={styles.subtitle}>
        Level {profile?.level || 1} • {profile?.totalXP || 0} XP
      </Text>

      <FlatList
        data={CHALLENGES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  center: { justifyContent: "center", alignItems: "center" },
  pageTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  daily: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  desc: {
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  xp: {
    color: colors.primary,
    fontWeight: "700",
  },
  claimBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  claimText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 12,
  },
  claimed: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  locked: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});