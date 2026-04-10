const API_BASE = 'https://4.dbt.io/api';
const API_KEY = import.meta.env.VITE_BIBLEBRAIN_KEY || '';

// Known Ga filesets
const GA_TEXT_OT = 'GASRNO1';
const GA_TEXT_NT = 'GASRNN1';
const GA_AUDIO_OT = 'GASRN1DA';
const GA_AUDIO_NT = 'GASRN2DA';

const NT_BOOKS = ['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
  'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE',
  '1JN','2JN','3JN','JUD','REV'];

function isNT(bookId: string): boolean {
  return NT_BOOKS.includes(bookId);
}

export interface Verse {
  verse_start: number;
  verse_end: number;
  verse_text: string;
}

export async function fetchBibleBrainVerses(
  bookId: string,
  chapter: number,
): Promise<Verse[]> {
  if (!API_KEY) return [];

  const filesetId = isNT(bookId) ? GA_TEXT_NT : GA_TEXT_OT;
  const url = `${API_BASE}/bibles/filesets/${filesetId}/${bookId}/${chapter}?v=4&key=${API_KEY}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Bible Brain text fetch failed: ${resp.status}`);

  const json = await resp.json();
  const data = json.data ?? [];

  return data.map((v: { verse_start: number; verse_end: number; verse_text: string }) => ({
    verse_start: v.verse_start,
    verse_end: v.verse_end,
    verse_text: v.verse_text,
  }));
}

export async function fetchBibleBrainAudioUrl(
  bookId: string,
  chapter: number,
): Promise<string | null> {
  if (!API_KEY) return null;

  const filesetId = isNT(bookId) ? GA_AUDIO_NT : GA_AUDIO_OT;
  const url = `${API_BASE}/bibles/filesets/${filesetId}/${bookId}/${chapter}?v=4&key=${API_KEY}`;

  const resp = await fetch(url);
  if (!resp.ok) return null;

  const json = await resp.json();
  const data = json.data ?? [];
  if (!data.length) return null;

  return data[0].path ?? null;
}
