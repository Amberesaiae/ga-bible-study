// Study Data Service
// Loads and queries Spurgeon commentary, Lady Guyon devotionals, and Strong's concordance

import type {
  StrongDefinition,
  CommentarySnippet,
  DevotionalEntry,
  StrongsDatabase,
  SpurgeonPsalmsDatabase,
} from "../types/bible";

// --- File Fetching Utility ---

// In-memory cache for JSON data files (avoid re-fetching on every call)
const cache: Record<string, unknown> = {};

async function fetchStudyData<T>(path: string): Promise<T> {
  if (cache[path]) {
    return cache[path] as T;
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Failed to load study data from ${path}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as T;
  cache[path] = data;
  return data;
}

// --- Strong's Dictionary ---

export async function getStrongDefinition(
  type: "hebrew" | "greek",
  number: string
): Promise<StrongDefinition | null> {
  const normalizedNumber = number.toUpperCase();
  const prefix = type === "hebrew" ? "H" : "G";

  // If the number already has the correct prefix, use it as-is.
  // If it's bare digits, prepend the prefix.
  const key = normalizedNumber.startsWith(prefix)
    ? normalizedNumber
    : `${prefix}${normalizedNumber.replace(/^[GH]/i, "")}`;

  const filePath =
    type === "hebrew" ? "/data/strongs-heb.json" : "/data/strongs-greek.json";

  try {
    const database = await fetchStudyData<StrongsDatabase>(filePath);
    return database[key] ?? null;
  } catch (error) {
    console.warn(`Strong's data unavailable (${filePath}):`, error);
    return null;
  }
}

export async function getAllStrongEntries(
  type: "hebrew" | "greek"
): Promise<StrongsDatabase> {
  const filePath =
    type === "hebrew" ? "/data/strongs-heb.json" : "/data/strongs-greek.json";

  try {
    return await fetchStudyData<StrongsDatabase>(filePath);
  } catch (error) {
    console.warn(`Strong's data unavailable (${filePath}):`, error);
    return {};
  }
}

// --- Spurgeon Commentary ---

// Map of book names to their Spurgeon abbreviation keys
const BOOK_ABBREVIATIONS: Record<string, string> = {
  Psalms: "Psa",
  Psalm: "Psa",
  psalms: "Psa",
  psalm: "Psa",
  // Extendable: add more book mappings as data grows
};

export async function getSpurgeonCommentary(
  book: string,
  chapter: number,
  verse: number
): Promise<CommentarySnippet[]> {
  const abbr = BOOK_ABBREVIATIONS[book] ?? book;
  const verseKey = `${abbr} ${chapter}:${verse}`;

  try {
    const database = await fetchStudyData<SpurgeonPsalmsDatabase>(
      "/data/spurgeon-psalms.json"
    );
    return database[verseKey] ?? [];
  } catch (error) {
    console.warn("Spurgeon commentary unavailable:", error);
    return [];
  }
}

export async function getSpurgeonChapterCommentary(
  book: string,
  chapter: number
): Promise<Record<string, CommentarySnippet[]>> {
  const abbr = BOOK_ABBREVIATIONS[book] ?? book;
  const chapterPrefix = `${abbr} ${chapter}:`;

  try {
    const database = await fetchStudyData<SpurgeonPsalmsDatabase>(
      "/data/spurgeon-psalms.json"
    );

    const chapterEntries: Record<string, CommentarySnippet[]> = {};
    for (const [key, snippets] of Object.entries(database)) {
      if (key.startsWith(chapterPrefix)) {
        chapterEntries[key] = snippets;
      }
    }
    return chapterEntries;
  } catch (error) {
    console.warn("Spurgeon chapter commentary unavailable:", error);
    return {};
  }
}

// --- Lady Guyon Devotionals ---

export async function getDevotionalEntry(
  id?: string
): Promise<DevotionalEntry | null> {
  try {
    const entries = await fetchStudyData<DevotionalEntry[]>(
      "/data/guyon-journal.json"
    );

    if (id) {
      return entries.find((e) => e.id === id) ?? null;
    }

    // Return today's entry (by date match), or a random one if no date match
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = entries.find((e) => e.date === today);
    if (todayEntry) return todayEntry;

    // Fallback: random entry
    if (entries.length > 0) {
      return entries[Math.floor(Math.random() * entries.length)];
    }

    return null;
  } catch (error) {
    console.warn("Devotional entries unavailable:", error);
    return null;
  }
}

export async function getAllDevotionalEntries(): Promise<DevotionalEntry[]> {
  try {
    return await fetchStudyData<DevotionalEntry[]>("/data/guyon-journal.json");
  } catch (error) {
    console.warn("Devotional entries unavailable:", error);
    return [];
  }
}

export async function getDevotionalsByVerse(
  verseRef: string
): Promise<DevotionalEntry[]> {
  try {
    const entries = await fetchStudyData<DevotionalEntry[]>(
      "/data/guyon-journal.json"
    );
    // Normalize verseRef for comparison (e.g., "John 4:14" matches array entries)
    const normalized = verseRef.trim();
    return entries.filter((entry) =>
      entry.related_verses.some(
        (v) => v.trim().toLowerCase() === normalized.toLowerCase()
      )
    );
  } catch (error) {
    console.warn("Devotional verse lookup unavailable:", error);
    return [];
  }
}
