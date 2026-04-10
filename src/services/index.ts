import { fetchBibleBrainVerses, fetchBibleBrainAudioUrl } from './biblebrain';
import { fetchYouVersionVerses } from './youversion';
import type { Verse } from './biblebrain';

export type { Verse };

/**
 * Fetch verses for a given book/chapter/version.
 * Tries Bible Brain first; falls back to YouVersion if unavailable.
 */
export async function fetchVerses(
  bookId: string,
  chapter: number,
  version: string,
): Promise<Verse[]> {
  // Bible Brain handles the Ga text natively — try it first
  if (import.meta.env.VITE_BIBLEBRAIN_KEY) {
    try {
      const verses = await fetchBibleBrainVerses(bookId, chapter);
      if (verses.length > 0) return verses;
    } catch (e) {
      console.warn('Bible Brain fetch failed, falling back to YouVersion', e);
    }
  }

  // Fallback to YouVersion (or custom endpoint)
  return fetchYouVersionVerses(bookId, chapter, version);
}

/**
 * Fetch audio URL for a given book/chapter.
 * Returns null if no audio is available or no API key is configured.
 */
export async function fetchAudioUrl(
  bookId: string,
  chapter: number,
): Promise<string | null> {
  return fetchBibleBrainAudioUrl(bookId, chapter);
}

export { getStudyNote } from './studyData';
