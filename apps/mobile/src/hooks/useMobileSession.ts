import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

export type MobileSessionState =
  | { ready: false; session: null; accessToken: null }
  | { ready: true; session: Session | null; accessToken: string | null };

export function useMobileSession(): MobileSessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_evt, next) => {
      setSession(next ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () =>
      ready
        ? {
            ready: true,
            session,
            accessToken: session?.access_token ?? null,
          }
        : { ready: false, session: null, accessToken: null },
    [ready, session],
  );
}
