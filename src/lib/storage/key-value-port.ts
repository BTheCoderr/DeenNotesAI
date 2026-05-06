/**
 * Expo-ready contract: swap `createLocalStorageKvPort()` for AsyncStorage-backed port on native.
 * Keep domain modules free of direct `window` / `localStorage` when practical.
 */

export type KeyValuePort = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function createLocalStorageKvPort(): KeyValuePort {
  return {
    getItem: async (key: string) => {
      if (typeof window === "undefined") return null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* quota */
      }
    },
    removeItem: async (key: string) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}
