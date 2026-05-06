import { useEffect } from "react";

import * as Notifications from "expo-notifications";

let installed = false;

/**
 * Ensures foreground presentation rules are defined once (required for local tests).
 */
export function useNotificationPresentationHandler() {
  useEffect(() => {
    if (installed) return;
    installed = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);
}
