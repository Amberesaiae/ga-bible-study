import type { BibleVersion, BibleChapter, BibleVerse } from "../types/bible";

const API_KEY = import.meta.env.VITE_YOUVERSION_KEY;
const BASE_URL = "https://api.youversionapi.com";
const DEFAULT_VERSIONS: string[] = ["TPT", "CJB", "TOJB", "Ga"];

export interface BookMapping {
  youversion: string;
  display: string;
}

export const BOOK_IDS: Record<string, BookMapping> = {
  GEN: { youversion: "GEN", display: "Genesis" },
  EXO: { youversion: "EXO", display: "Exodus" },
  LEV: { youversion: "LEV", display: "Leviticus" },
  NUM: { youversion: "NUM", display: "Numbers" },
  DEU: { youversion: "DEU", display: "Deuteronomy" },
  JOS: { youversion: "JOS", display: "Joshua" },
  JDG: { youversion: "JDG", display: "Judges" },
  RUT: { youversion: "RUT", display: "Ruth" },
  "1SA": { youversion: "1SA", display: "1 Samuel" },
  "2SA": { youversion: "2SA", display: "2 Samuel" },
  "1KI": { youversion: "1KI", display: "1 Kings" },
  "2KI": { youversion: "2KI", display: "2 Kings" },
  "1CH": { youversion: "1CH", display: "1 Chronicles" },
  "2CH": { youversion: "2CH", display: "2 Chronicles" },
  EZR: { youversion: "EZR", display: "Ezra" },
  NEH: { youversion: "NEH", display: "Nehemiah" },
  EST: { youversion: "EST", display: "Esther" },
  JOB: { youversion: "JOB", display: "Job" },
  PSA: { youversion: "PSA", display: "Psalms" },
  PRO: { youversion: "PRO", display: "Proverbs" },
  ECC: { youversion: "ECC", display: "Ecclesiastes" },
  SNG: { youversion: "SNG", display: "Song of Solomon" },
  ISA: { youversion: "ISA", display: "Isaiah" },
  JER: { youversion: "JER", display: "Jeremiah" },
  LAM: { youversion: "LAM", display: "Lamentations" },
  EZK: { youversion: "EZK", display: "Ezekiel" },
  DAN: { youversion: "DAN", display: "Daniel" },
  HOS: { youversion: "HOS", display: "Hosea" },
  JOL: { youversion: "JOL", display: "Joel" },
  AMO: { youversion: "AMO", display: "Amos" },
  OBA: { youversion: "OBA", display: "Obadiah" },
  JON: { youversion: "JON", display: "Jonah" },
  MIC: { youversion: "MIC", display: "Micah" },
  NAM: { youversion: "NAM", display: "Nahum" },
  HAB: { youversion: "HAB", display: "Habakkuk" },
  ZEP: { youversion: "ZEP", display: "Zephaniah" },
  HAG: { youversion: "HAG", display: "Haggai" },
  ZEC: { youversion: "ZEC", display: "Zechariah" },
  MAL: { youversion: "MAL", display: "Malachi" },
  MAT: { youversion: "MAT", display: "Matthew" },
  MRK: { youversion: "MRK", display: "Mark" },
  LUK: { youversion: "LUK", display: "Luke" },
  JHN: { youversion: "JHN", display: "John" },
  ACT: { youversion: "ACT", display: "Acts" },
  ROM: { youversion: "ROM", display: "Romans" },
  "1CO": { youversion: "1CO", display: "1 Corinthians" },
  "2CO": { youversion: "2CO", display: "2 Corinthians" },
  GAL: { youversion: "GAL", display: "Galatians" },
  EPH: { youversion: "EPH", display: "Ephesians" },
  PHP: { youversion: "PHP", display: "Philippians" },
  COL: { youversion: "COL", display: "Colossians" },
  "1TH": { youversion: "1TH", display: "1 Thessalonians" },
  "2TH": { youversion: "2TH", display: "2 Thessalonians" },
  "1TI": { youversion: "1TI", display: "1 Timothy" },
  "2TI": { youversion: "2TI", display: "2 Timothy" },
  TIT: { youversion: "TIT", display: "Titus" },
  PHM: { youversion: "PHM", display: "Philemon" },
  HEB: { youversion: "HEB", display: "Hebrews" },
  JAS: { youversion: "JAS", display: "James" },
  "1PE": { youversion: "1PE", display: "1 Peter" },
  "2PE": { youversion: "2PE", display: "2 Peter" },
  "1JN": { youversion: "1JN", display: "1 John" },
  "2JN": { youversion: "2JN", display: "2 John" },
  "3JN": { youversion: "3JN", display: "3 John" },
  JUD: { youversion: "JUD", display: "Jude" },
  REV: { youversion: "REV", display: "Revelation" },
};

function toYVBookId(bookId: string): string {
  return BOOK_IDS[bookId]?.youversion || bookId.toUpperCase();
}

async function fetchAPI<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "X-YouVersion-Developer": API_KEY || "",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    throw new Error(`YouVersion API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getVersions(): Promise<BibleVersion[]> {
  if (!API_KEY) {
    console.warn("YouVersion API key not set. Returning default versions.");
    return DEFAULT_VERSIONS.map((id) => ({ id, name: id }));
  }

  try {
    const data = await fetchAPI<{
      data: Record<string, { name: string; language?: { name: string } }>;
    }>(`${BASE_URL}/bible/versions.json`);

    const allVersions: BibleVersion[] = Object.entries(data.data).map(
      ([id, info]) => ({
        id,
        name: typeof info === "object"
          ? `${info.language?.name || ""} ${info.name}`.trim()
          : id,
      })
    );

    // Prioritize target versions
    const sorted = [...allVersions];
    sorted.sort((a, b) => {
      const aIdx = DEFAULT_VERSIONS.indexOf(a.id);
      const bIdx = DEFAULT_VERSIONS.indexOf(b.id);
      if (aIdx !== -1 && bIdx === -1) return -1;
      if (bIdx !== -1 && aIdx === -1) return 1;
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      return a.name.localeCompare(b.name);
    });

    return sorted;
  } catch (error) {
    console.error("Failed to fetch YouVersion versions:", error);
    return DEFAULT_VERSIONS.map((id) => ({ id, name: id }));
  }
}

export async function getChapterContent(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<BibleChapter> {
  const yvBookId = toYVBookId(bookId);
  const bookName = BOOK_IDS[bookId]?.display || bookId;

  if (!API_KEY) {
    console.warn("YouVersion API key not set. Returning mock data.");
    return {
      number: chapter,
      bookId,
      versionId,
      verses: [
        {
          number: 1,
          text: `Set VITE_YOUVERSION_KEY to load ${bookName} ${chapter}.`,
          ref: `${bookName} ${chapter}:1`,
        },
      ],
    };
  }

  try {
    const data = await fetchAPI<{
      data: {
        verses: Array<{ number: string | number; text: string }>;
      };
    }>(`${BASE_URL}/bible/versions/${versionId}/bibles/${yvBookId}/chapters/${chapter}.json`);

    const verses: BibleVerse[] = (data.data.verses || []).map((v) => ({
      number: typeof v.number === "string" ? parseInt(v.number, 10) : v.number,
      text: v.text,
      ref: `${bookName} ${chapter}:${v.number}`,
    }));

    return { number: chapter, bookId, versionId, verses };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load ${bookName} ${chapter} from ${versionId}: ${msg}`);
  }
}
