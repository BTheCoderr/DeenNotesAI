import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { KhutbahRecordingMeta } from "../../src/contracts/khutbah-recording";
import { formatDurationShort } from "../../src/lib/khutbah-compose";
import { listKhutbahRecordings } from "../../src/lib/khutbah-recordings-storage";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function KhutbahRecordingsScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<KhutbahRecordingMeta[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await listKhutbahRecordings();
    setRows(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const data = useMemo(() => rows, [rows]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
            tintColor={emerald}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Recordings</Text>
            <Text style={styles.sub}>Saved on this device only.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No recordings yet</Text>
            <Text style={styles.emptyBody}>
              From New, choose Record Khutbah to capture a lecture or reminder.
            </Text>
            <Pressable style={styles.cta} onPress={() => router.push("/recording/session")}>
              <Text style={styles.ctaTxt}>Start recording</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/recordings/${item.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title?.trim() || "Untitled khutbah"}
              </Text>
              <Text style={styles.rowMeta}>
                {formatWhen(item.createdAt)} · {formatDurationShort(item.durationMillis)}
              </Text>
            </View>
            {item.linkedReflectionId ? (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>Linked</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  list: { padding: spacing.xl, paddingBottom: 48, gap: spacing.sm },
  header: { marginBottom: spacing.lg },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    color: ink,
    marginBottom: 4,
  },
  sub: { fontSize: fontSizes.sm, color: muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.lg,
    backgroundColor: cardBg,
    padding: spacing.lg,
  },
  rowTitle: { fontSize: fontSizes.md, fontWeight: "800", color: ink },
  rowMeta: { fontSize: fontSizes.sm, color: muted, marginTop: 4 },
  badge: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTxt: { fontSize: 11, fontWeight: "800", color: bronze },
  empty: { paddingVertical: 32, gap: spacing.md },
  emptyTitle: { fontFamily: fontSerifHeading, fontSize: 22, color: ink },
  emptyBody: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
});
