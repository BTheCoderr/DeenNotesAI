import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { border, bronze, cardBg, emerald, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

/** TODO M3.5: Supabase list when mobile session + RLS wiring lands. */
type NoteListItem = {
  id: string;
  title: string;
  short_summary: string | null;
  created_at: string;
};

const PLACEHOLDER_NOTES: NoteListItem[] = [];

export default function ReflectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Text style={styles.h1}>Reflect</Text>
      <Text style={styles.sub}>
        Your khutbah notes, Qur’an reflections, and reminders — in one calm library.
      </Text>

      <FlatList
        data={PLACEHOLDER_NOTES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reflections yet</Text>
            <Text style={styles.muted}>
              When you save notes on this device, they will show here. Supabase list wiring comes
              next.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.push("/new-sheet")}
            >
              <Text style={styles.ctaTxt}>Create your first reflection</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/notes/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSum} numberOfLines={2}>
              {item.short_summary ?? ""}
            </Text>
            <Text style={styles.cardMeta}>{item.created_at}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone, paddingHorizontal: spacing.xl },
  h1: { fontSize: 28, fontWeight: "800", color: ink, marginBottom: spacing.xs },
  sub: { fontSize: fontSizes.sm, color: muted, marginBottom: spacing.lg, lineHeight: 20 },
  list: { paddingBottom: 120, flexGrow: 1 },
  empty: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    gap: spacing.md,
  },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: "800", color: ink },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 52,
    justifyContent: "center",
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardTitle: { fontSize: fontSizes.md, fontWeight: "800", color: ink },
  cardSum: { fontSize: fontSizes.sm, color: muted },
  cardMeta: {
    fontSize: fontSizes.xs,
    color: bronze,
    fontVariant: ["tabular-nums"],
  },
});
