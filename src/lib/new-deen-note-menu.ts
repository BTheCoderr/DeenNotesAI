import { NOTE_MODE_CONTRACTS, type NoteModeId } from "@/shared/note-modes";

export type NewDeenNoteModeId = NoteModeId;

export type NewDeenNoteMenuRow = {
  mode: NewDeenNoteModeId;
  title: string;
  description: string;
  /** Premium / backend not ready yet */
  comingSoon?: boolean;
};

export const NEW_DEEN_NOTE_MENU_ROWS: NewDeenNoteMenuRow[] = [
  ...NOTE_MODE_CONTRACTS.filter((m) => m.enabled).map((m) => ({
    mode: m.id,
    title: m.label,
    description: m.description,
    ...(m.comingSoon ? { comingSoon: true } : {}),
  })),
];
