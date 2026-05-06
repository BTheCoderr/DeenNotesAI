import { StyleSheet, Text, View } from "react-native";

export default function QuranScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Quran</Text>
      <Text style={styles.body}>Reader will call Next `/api/quran/*` proxy (Phase M3).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: "#F6F4F0" },
  h1: { fontSize: 28, fontWeight: "600", color: "#1a1a1a", marginBottom: 12 },
  body: { fontSize: 15, color: "#5c5348", lineHeight: 22 },
});
