/**
 * Future: PDF mushaf pages or study PDFs → OCR text → guarded AI reflection → saved DeenNote.
 *
 * Stages are intentionally decoupled so the same graph can run in Next.js workers
 * or an Expo/React Native ingestion job with shared DTOs.
 */

/** Binary or storage handle for an uploaded PDF (implementation TBD). */
export type PdfIngestionSource = {
  kind: "pdf";
  /** Opaque id (e.g. Supabase storage path or local file URI on device). */
  ref: string;
  /** Optional user-visible label. */
  label?: string;
};

/** Normalized OCR output — preserve line breaks where the engine provides them. */
export type PdfOcrPageChunk = {
  pageIndex: number;
  text: string;
  confidence?: number;
};

export type PdfOcrResult = {
  source: PdfIngestionSource;
  pages: PdfOcrPageChunk[];
  /** Engine + model version for audit (e.g. "tesseract/5"). */
  ocrEngineVersion?: string;
};

/** Prompt context sent to the reflection model — no automatic QuranEnc text mutation. */
export type AiReflectionInput = {
  ocr: PdfOcrResult;
  /** Optional user goal (e.g. "summarize themes for a DeenNote"). */
  userIntent?: string;
  locale?: string;
};

/** Draft DeenNote payload — align with your notes schema when wiring persistence. */
export type DeenNoteDraft = {
  title: string;
  bodyMarkdown: string;
  /** Provenance for scholars and users. */
  sources: { type: "pdf_ocr" | "user"; ref: string; note?: string }[];
};

/**
 * Pipeline graph (implement later):
 * 1. `ingestPdf` — validate size, virus scan, store blob.
 * 2. `runOcr` — page-by-page OCR; chunk for token limits.
 * 3. `reflectWithAi` — server-only keys; cite OCR spans; no unauthorized re-translation of licensed Qur'an text.
 * 4. `persistDeenNote` — Supabase/local-first reconcile with bookmarks.
 */
export type PdfToDeenNotePipeline = {
  ingestPdf: (source: PdfIngestionSource) => Promise<{ storedRef: string }>;
  runOcr: (storedRef: string) => Promise<PdfOcrResult>;
  reflectWithAi: (input: AiReflectionInput) => Promise<DeenNoteDraft>;
  persistDeenNote: (draft: DeenNoteDraft) => Promise<{ noteId: string }>;
};
