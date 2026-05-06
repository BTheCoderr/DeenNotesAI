import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NewSheetScreen() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Quiet capture</Text>
      <Text style={styles.body}>
        Mirrors web “New DeenNote” modes — transcription later (Phase M5).
      </Text>
      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnTxt}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, backgroundColor: "#F6F4F0" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8, color: "#1a1a1a" },
  body: { fontSize: 15, color: "#5c5348", lineHeight: 22 },
  btn: {
    marginTop: 24,
    alignSelf: "flex-start",
    backgroundColor: "#127A63",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  btnTxt: { color: "#fff", fontWeight: "600" },
});
