import { create } from 'zustand';
import type { VerseTiming } from '../types/bible';

export interface AudioState {
  // Playback state
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;

  // Passage state
  currentPassage: string;         // e.g. "John 3"
  currentBook: string | null;     // e.g. "JHN"
  currentChapter: number | null;  // e.g. 3
  audioUrl: string;
  filesetId: string;

  // Synchronization
  highlightedVerse: number | null;
  verseTimings: VerseTiming[];

  // Buffering state (loading individual verses/timings)
  isBuffering: boolean;

  // Fetch states (loading entire passage/audio)
  isLoading: boolean;
  error: string | null;

  // Actions - Playback
  togglePlayback: () => void;
  setPlaybackRate: (rate: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;

  // Actions - Synchronization
  setHighlightedVerse: (verseNum: number | null) => void;
  setBuffering: (val: boolean) => void;

  // Actions - Passage
  setPassage: (book: string, chapter: number) => void;
  loadPassage: (book: string, chapter: number, filesetId: string) => void;

  // Actions - Utility
  reset: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  // Playback state
  isPlaying: false,
  playbackRate: 1,
  currentTime: 0,
  duration: 0,

  // Passage state
  currentPassage: '',
  currentBook: null,
  currentChapter: null,
  audioUrl: '',
  filesetId: '',

  // Synchronization
  highlightedVerse: null,
  verseTimings: [],

  // Buffering / Fetch states
  isBuffering: false,
  isLoading: false,
  error: null,

  // Actions - Playback
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  // Actions - Synchronization
  setHighlightedVerse: (verseNum: number | null) => set({ highlightedVerse: verseNum }),
  setBuffering: (val: boolean) => set({ isBuffering: val }),

  // Actions - Passage (simple)
  setPassage: (book: string, chapter: number) =>
    set({
      currentPassage: `${book} ${chapter}`,
      currentBook: book,
      currentChapter: chapter,
    }),

  // Actions - Passage (full load with filesetId)
  loadPassage: (book: string, chapter: number, filesetId: string) =>
    set({
      currentPassage: `${book} ${chapter}`,
      currentBook: book,
      currentChapter: chapter,
      filesetId,
      audioUrl: '',
      currentTime: 0,
      duration: 0,
      highlightedVerse: null,
      verseTimings: [],
      isBuffering: false,
      isLoading: true,
      error: null,
    }),

  // Actions - Utility
  reset: () =>
    set({
      isPlaying: false,
      currentPassage: '',
      currentBook: null,
      currentChapter: null,
      audioUrl: '',
      filesetId: '',
      currentTime: 0,
      duration: 0,
      highlightedVerse: null,
      verseTimings: [],
      isBuffering: false,
      isLoading: false,
      error: null,
    }),

  setError: (error) => set({ error, isLoading: false, isBuffering: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
