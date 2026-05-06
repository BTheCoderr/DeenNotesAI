import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.body}>
        Profile, prayer & Quran preferences — shared contracts in Phase M2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, backgroundColor: "#F6F4F0" },
  body: { fontSize: 15, color: "#5c5348", lineHeight: 22 },
});
