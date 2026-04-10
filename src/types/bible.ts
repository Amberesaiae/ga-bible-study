// Bible text and audio types for the Ga Bible Study app

export interface BibleVersion {
  id: string; // e.g. "TPT", "CJB", "TOJB", "Ga"
  name: string; // display name
}

export interface BibleBook {
  id: string; // e.g. "JHN"
  name: string; // e.g. "John"
  abbreviation: string; // e.g. "Jn"
}

export interface BibleVerse {
  number: number;
  text: string;
  ref: string; // e.g. "John 3:16"
}

export interface BibleChapter {
  number: number;
  bookId: string;
  versionId: string;
  verses: BibleVerse[];
}

export interface AudioFileset {
  id: string; // Bible Brain fileset ID (e.g. "GASRN2DA")
  language: string; // ISO 639-3 language code (e.g. "gaa")
  type: "audio_drama" | "audio";
  name?: string;
}

export interface VerseTiming {
  verse_num: number;
  end_time: number; // seconds from start of audio
}

export interface BibleStudyData {
  chapter: BibleChapter;
  audioUrl?: string;
  timings?: VerseTiming[];
  filesetId?: string;
}

// Study data types: Strong's Concordance
export interface StrongDefinition {
  lemma: string; // original language word (e.g. "Ἰησοῦς")
  transliteration: string; // e.g. "Iēsous"
  pronunciation: string; // e.g. "ee-ay-sooce'"
  definition: string; // full definition text
  partOfSpeech: string; // e.g. "noun", "verb", "proper noun"
  strongsNumber: string; // e.g. "G2424" or "H430"
}

// Study data types: Commentary
type CommentaryType = "spurgeon" | "calvin" | "matthew-henry";

export interface CommentarySnippet {
  type: CommentaryType;
  text: string;
  author: string;
  source?: string; // e.g. "Treasury of David"
}

// Study data types: Devotional
export interface DevotionalEntry {
  id: string;
  date: string; // ISO date string, e.g. "1680-01-01"
  title: string;
  text: string;
  related_verses: string[]; // e.g. ["John 4:14"]
}

// Maps for bulk data loading
export type StrongsDatabase = Record<string, StrongDefinition>;
export type SpurgeonPsalmsDatabase = Record<string, CommentarySnippet[]>;
