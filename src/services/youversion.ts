/**
 * YouVersion fallback service.
 * NOTE: YouVersion does not have an official public API.
 * This module is a placeholder for future integration or a
 * self-hosted Bible text endpoint. Currently returns an empty array.
 */

import type { Verse } from './biblebrain';

export async function fetchYouVersionVerses(
  _bookId: string,
  _chapter: number,
  _version: string,
): Promise<Verse[]> {
  // Placeholder — implement with your own Bible text API endpoint
  // or a self-hosted copy of public-domain Bible text (KJV, ASV, etc.)
  return [];
}
