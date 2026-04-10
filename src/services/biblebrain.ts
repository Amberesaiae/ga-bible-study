import type { AudioFileset, VerseTiming } from "../types/bible";

const API_KEY = import.meta.env.VITE_BIBLEBRAIN_KEY;
const BASE_URL = "https://api.bibles.is/v1";

// Known Ga filesets for quick lookup
export const GA_FILESETS: AudioFileset[] = [
  {
    id: "GASRN2DA",
    language: "gaa",
    type: "audio_drama",
    name: "Ga Audio Drama (NT)",
  },
  {
    id: "GASRN1DA",
    language: "gaa",
    type: "audio_drama",
    name: "Ga Audio Drama (OT)",
  },
];

function getHeaders(): Record<string, string> {
  return {
    "Accept": "application/json",
    "api-key": API_KEY || "demo-key",
  };
}

async function fetchAPI<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`Bible Brain API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Look up the Bible Brain fileset ID for a given Ga version.
 * Falls back to known Ga filesets if API key is not set.
 */
export async function getFilesetId(
  language: string = "gaa",
  version?: string
): Promise<string> {
  if (!API_KEY) {
    console.warn("Bible Brain API key not set. Using known Ga fileset.");
    const fileset = GA_FILESETS.find((f) => f.type === "audio_drama") || GA_FILESETS[0];
    return fileset.id;
  }

  try {
    // Search for filesets matching language and optional version filter
    const url = `${BASE_URL}/filesets`;
    const params = new URLSearchParams({
      type: "audio",
      language: language,
    });

    const data = await fetchAPI<
      Array<{
        id: string;
        name: string;
        type: string;
        language: {
          id: string;
          name: string;
        };
      }>
    >(`${url}?${params.toString()}`);

    // If version is specified, try to match it in the name or id
    if (version) {
      const match = data.find(
        (f) =>
          f.id.toLowerCase().includes(version.toLowerCase()) ||
          f.name.toLowerCase().includes(version.toLowerCase())
      );
      if (match) return match.id;
    }

    // Prefer audio_drama over plain audio
    const dramaFileset = data.find((f) => f.type === "audio_drama");
    if (dramaFileset) return dramaFileset.id;

    if (data.length > 0) return data[0].id;

    // Fallback
    return GA_FILESETS[0].id;
  } catch (error) {
    console.error("Failed to fetch fileset from Bible Brain:", error);
    return GA_FILESETS[0].id;
  }
}

/**
 * Resolve the API chapter endpoint into an actual playable MP3 URL.
 * Fetches the chapter metadata and extracts the audio source path.
 */
export async function getPlayableAudioUrl(
  filesetId: string,
  bookId: string,
  chapter: number
): Promise<string> {
  const apiUrl = getChapterAudioUrl(filesetId, bookId, chapter);

  // When no API key, return a placeholder so the hook can fall back gracefully
  if (!API_KEY) {
    console.warn("Bible Brain API key not set. Cannot resolve playable URL.");
    return "";
  }

  try {
    const data = await fetchAPI<{
      data: {
        path?: string;
        duration?: number;
        meta?: {
          timing?: Array<{ verse_num: number; end_time: number }>;
        };
        content?: Array<{
          verse_num: number;
          style?: string;
          text?: string;
        }>;
      };
    }>(apiUrl);

    if (data.data?.path) {
      // Bible Brain returns relative paths; make them absolute
      const path = data.data.path;
      if (path.startsWith("http")) return path;
      return `https://api.bibles.is/v1/filesets/${filesetId}/file/${path}`;
    }

    return "";
  } catch (error) {
    console.error("Failed to resolve playable audio URL:", error);
    return "";
  }
}

/**
 * Get the direct MP3 stream URL for a specific chapter.
 * Book IDs should match the Bible Brain format (e.g., "JHN" for John).
 */
export function getChapterAudioUrl(
  filesetId: string,
  bookId: string,
  chapter: number
): string {
  // Bible Brain provides direct audio URLs for scripture segments
  // The URL format: /filesets/{id}/chapters/{book}{chapter}
  const paddedChapter = chapter.toString().padStart(3, "0");
  return `${BASE_URL}/filesets/${filesetId}/chapters/${bookId}${paddedChapter}`;
}

/**
 * Get verse timing data for synchronization.
 * Returns an array of { verse_num, end_time } mapping verse numbers
 * to their end time in seconds within the audio track.
 */
export async function getVerseTiming(
  filesetId: string,
  bookId: string,
  chapter: number
): Promise<VerseTiming[]> {
  if (!API_KEY) {
    console.warn("Bible Brain API key not set. Returning empty timings.");
    return [];
  }

  try {
    const paddedChapter = chapter.toString().padStart(3, "0");
    const url = `${BASE_URL}/filesets/${filesetId}/chapters/${bookId}${paddedChapter}`;

    const data = await fetchAPI<{
      data: {
        meta?: {
          timing?: Array<{
            verse_num: number;
            end_time: number;
          }>;
        };
        content?: Array<{
          verse_num: number;
          end_time?: number;
          timestamp?: number;
        }>;
      };
    }>(url);

    // Try to extract timing from meta timing data
    if (data.data?.meta?.timing) {
      return data.data.meta.timing.map((t) => ({
        verse_num: t.verse_num,
        end_time: t.end_time,
      }));
    }

    // Fallback: extract from content if available
    if (data.data?.content) {
      const timings: VerseTiming[] = [];
      let currentTime = 0;
      for (const item of data.data.content) {
        if (item.end_time) {
          timings.push({
            verse_num: item.verse_num,
            end_time: item.end_time,
          });
        } else if (item.timestamp) {
          // timestamp comes in milliseconds; convert to seconds
          const endTimeSec = item.timestamp / 1000;
          if (endTimeSec > currentTime) {
            timings.push({
              verse_num: item.verse_num,
              end_time: endTimeSec,
            });
            currentTime = endTimeSec;
          }
        }
      }
      return timings;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch verse timings:", error);
    return [];
  }
}

/**
 * List all available filesets for a given language.
 * Useful for letting users choose between drama/non-drama recordings.
 */
export async function listFilesets(language: string = "gaa"): Promise<AudioFileset[]> {
  if (!API_KEY) {
    return GA_FILESETS;
  }

  try {
    const url = `${BASE_URL}/filesets?type=audio&language=${language}`;
    const data = await fetchAPI<
      Array<{
        id: string;
        name: string;
        type: string;
        language: { id: string; name: string };
      }>
    >(url);

    return data.map((item) => ({
      id: item.id,
      language: item.language?.id || language,
      type: item.type === "audio_drama" ? "audio_drama" : "audio",
      name: item.name,
    }));
  } catch (error) {
    console.error("Failed to list filesets:", error);
    return GA_FILESETS;
  }
}
