import NetInfo from "@react-native-community/netinfo";
import { onlineManager, QueryClient } from "@tanstack/react-query";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const ok = state.isConnected !== false && state.isInternetReachable !== false;
    setOnline(ok);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, networkMode: "online" },
  },
});
