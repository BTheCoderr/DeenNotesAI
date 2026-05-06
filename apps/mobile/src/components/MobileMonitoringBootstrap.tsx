import { useEffect } from "react";

import { initMobileMonitoring } from "../lib/sentry/mobile";

export function MobileMonitoringBootstrap() {
  useEffect(() => {
    initMobileMonitoring();
  }, []);

  return null;
}
