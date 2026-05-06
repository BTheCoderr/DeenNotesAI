"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { NewDeenNoteSheet } from "@/components/app/NewDeenNoteSheet";

type Ctx = {
  openNewNoteMenu: () => void;
  closeNewNoteMenu: () => void;
};

const NewNoteMenuContext = createContext<Ctx | null>(null);

export function useNewNoteMenu() {
  const v = useContext(NewNoteMenuContext);
  if (!v) {
    throw new Error("useNewNoteMenu must be used within DashboardProviders");
  }
  return v;
}

export function DashboardProviders({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openNewNoteMenu = useCallback(() => setOpen(true), []);
  const closeNewNoteMenu = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openNewNoteMenu, closeNewNoteMenu }),
    [openNewNoteMenu, closeNewNoteMenu],
  );

  return (
    <NewNoteMenuContext.Provider value={value}>
      {children}
      <NewDeenNoteSheet open={open} onOpenChange={setOpen} />
    </NewNoteMenuContext.Provider>
  );
}
