import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

function likelyOffline(s: NetInfoState): boolean {
  if (s.isConnected === false) return true;
  if (s.isConnected === true && s.isInternetReachable === false) return true;
  return false;
}

type NetCtx = {
  /** True when radios / reachability indicate no usable network. */
  isOffline: boolean;
  /** Re-run reachability ping (does not mutate React Query caches). */
  recheckNetwork: () => void;
};

const NetworkStatusContext = createContext<NetCtx | null>(null);

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  const applyState = useCallback((s: NetInfoState) => {
    setIsOffline(likelyOffline(s));
  }, []);

  useEffect(() => {
    let alive = true;
    void NetInfo.fetch().then((s) => {
      if (!alive) return;
      applyState(s);
    });
    const unsub = NetInfo.addEventListener((s) => {
      if (!alive) return;
      applyState(s);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [applyState]);

  const recheckNetwork = useCallback(() => {
    void NetInfo.refresh().then((s) => applyState(s));
  }, [applyState]);

  const value = useMemo(
    (): NetCtx => ({
      isOffline,
      recheckNetwork,
    }),
    [isOffline, recheckNetwork],
  );

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
}

export function useNetworkStatus(): NetCtx {
  const v = useContext(NetworkStatusContext);
  if (!v) throw new Error("useNetworkStatus must be used inside NetworkStatusProvider");
  return v;
}
