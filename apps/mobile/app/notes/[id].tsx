import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fontSizes, ink, muted, spacing, stone } from "../../src/theme";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nid = Array.isArray(id) ? id[0] : id;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Reflection</Text>
        <Text style={styles.mono}>#{nid ?? "—"}</Text>
        <Text style={styles.body}>
          Note detail will load from Supabase using the same row shape as the web app. This route is
          wired for deep linking and list navigation.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { flex: 1, padding: spacing.xl, gap: spacing.md },
  h1: { fontSize: 28, fontWeight: "800", color: ink },
  mono: { fontSize: fontSizes.sm, color: muted },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
});
