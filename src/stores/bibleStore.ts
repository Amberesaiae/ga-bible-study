import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
}

interface BibleState {
  currentBook: string;
  chapter: number;
  primaryVersion: string;
  isParallel: boolean;
  availableVersions: BibleVersion[];
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVersions: (versionId: string) => void;
  toggleParallel: () => void;
  nextChapter: (maxChapter: number) => void;
  prevChapter: () => void;
}

const DEFAULT_VERSIONS: BibleVersion[] = [
  { id: 'GASRN', name: 'Ga New Testament (Dramatized)', language: 'ga' },
  { id: 'KJV', name: 'King James Version', language: 'en' },
  { id: 'NIV', name: 'New International Version', language: 'en' },
  { id: 'ESV', name: 'English Standard Version', language: 'en' },
];

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      currentBook: 'JHN',
      chapter: 3,
      primaryVersion: 'GASRN',
      isParallel: false,
      availableVersions: DEFAULT_VERSIONS,

      setBook: (book: string) => set({ currentBook: book, chapter: 1 }),

      setChapter: (chapter: number) => set({ chapter }),

      setVersions: (versionId: string) => set({ primaryVersion: versionId }),

      toggleParallel: () => set((state) => ({ isParallel: !state.isParallel })),

      nextChapter: (maxChapter: number) => {
        const { chapter } = get();
        if (chapter < maxChapter) set({ chapter: chapter + 1 });
      },

      prevChapter: () => {
        const { chapter } = get();
        if (chapter > 1) set({ chapter: chapter - 1 });
      },
    }),
    {
      name: 'ga-bible-store',
      partialize: (state) => ({
        currentBook: state.currentBook,
        chapter: state.chapter,
        primaryVersion: state.primaryVersion,
        isParallel: state.isParallel,
      }),
    },
  ),
);
