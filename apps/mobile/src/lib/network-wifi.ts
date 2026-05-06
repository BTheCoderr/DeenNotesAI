import NetInfo from "@react-native-community/netinfo";

/**
 * Conservative: treat ethernet + wifi as unmetered; cellular → skip when user chose Wi‑Fi–only downloads.
 */
export async function preferSkipMobileDownload(audioWifiOnly: boolean): Promise<{
  skip: boolean;
  reason?: "wifi_only";
}> {
  if (!audioWifiOnly) return { skip: false };
  const s = await NetInfo.fetch();
  const t = String(s.type);
  if (t === "wifi" || t === "ethernet") {
    return { skip: false };
  }
  if (t === "none" || !s.isConnected) {
    return { skip: true, reason: "wifi_only" };
  }
  return { skip: true, reason: "wifi_only" };
}
