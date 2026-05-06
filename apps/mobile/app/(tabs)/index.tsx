import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function TodayScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Today</Text>
      <Text style={styles.body}>
        Emotional home placeholder — rhythm card, ayah, reflection (Phase M3).
      </Text>
      <Link href="/settings" style={styles.link}>
        Settings · profile shell
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
    backgroundColor: "#F6F4F0",
  },
  h1: { fontSize: 28, fontWeight: "600", color: "#1a1a1a", marginBottom: 12 },
  body: { fontSize: 15, color: "#5c5348", lineHeight: 22 },
  link: { marginTop: 24, color: "#127A63", fontWeight: "600" },
});
