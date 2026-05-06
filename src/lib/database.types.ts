export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type NoteTypeEnum =
  | "khutbah"
  | "lecture"
  | "quran_reflection"
  | "halaqa"
  | "personal_reminder";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      deen_notes: {
        Row: {
          id: string;
          user_id: string;
          note_type: NoteTypeEnum;
          title: string;
          raw_input: string;
          summary: string;
          short_summary: string;
          main_reminder: string;
          key_reminders: Json;
          action_steps: Json;
          reflection_questions: Json;
          dua_prompts: Json;
          share_card_text: string;
          disclaimer: string;
          /** Structured ayah refs `{ chapter, verse }[]` — optional legacy null */
          quran_refs: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_type: NoteTypeEnum;
          title: string;
          raw_input: string;
          summary?: string;
          short_summary?: string;
          main_reminder?: string;
          key_reminders?: Json;
          action_steps?: Json;
          reflection_questions?: Json;
          dua_prompts?: Json;
          share_card_text?: string;
          disclaimer: string;
          quran_refs?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_type?: NoteTypeEnum;
          title?: string;
          raw_input?: string;
          summary?: string;
          short_summary?: string;
          main_reminder?: string;
          key_reminders?: Json;
          action_steps?: Json;
          reflection_questions?: Json;
          dua_prompts?: Json;
          share_card_text?: string;
          disclaimer?: string;
          quran_refs?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_share_cards: {
        Row: {
          id: string;
          user_id: string;
          deen_note_id: string | null;
          share_card_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deen_note_id?: string | null;
          share_card_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deen_note_id?: string | null;
          share_card_text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_onboarding_profiles: {
        Row: {
          user_id: string;
          purpose: string | null;
          age_group: string | null;
          user_type: string | null;
          struggles: string[] | null;
          completed_at: string | null;
        };
        Insert: {
          user_id: string;
          purpose?: string | null;
          age_group?: string | null;
          user_type?: string | null;
          struggles?: string[] | null;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          purpose?: string | null;
          age_group?: string | null;
          user_type?: string | null;
          struggles?: string[] | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      note_type: NoteTypeEnum;
    };
  };
};
