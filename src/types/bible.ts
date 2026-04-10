export interface Verse {
  verse_start: number;
  verse_end: number;
  verse_text: string;
}

export interface Chapter {
  book_id: string;
  book_name: string;
  chapter: number;
  verses: Verse[];
}

export interface BibleBook {
  book_id: string;
  name: string;
  name_short: string;
  testament: 'OT' | 'NT';
  chapter_count: number;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  filesets?: {
    text?: string;
    audio?: string;
  };
}

export interface AudioTiming {
  verse_start: number;
  verse_end: number;
  timestamp: number;
}

export interface StudyNote {
  verse: number;
  commentary?: string;
  crossReferences?: string[];
  devotional?: string;
}
