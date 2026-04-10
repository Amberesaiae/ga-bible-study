import { create } from 'zustand';
import { BibleVersion } from '../types/bible';

interface BibleState {
  currentBook: string;
  chapter: number;
  primaryVersion: string;
  parallelVersion: string;
  isParallel: boolean;
  availableVersions: BibleVersion[];
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVersions: (primary?: string, parallel?: string) => void;
  toggleParallel: () => void;
  setAvailableVersions: (versions: BibleVersion[]) => void;
  nextChapter: (maxChapters: number) => void;
  prevChapter: () => void;
}

export const useBibleStore = create<BibleState>((set) => ({
  currentBook: 'GEN',
  chapter: 1,
  primaryVersion: 'TPT',
  parallelVersion: 'NEG',
  isParallel: false,
  availableVersions: [
    { id: 'TPT', name: 'The Passion Translation' },
    { id: 'CJB', name: 'Complete Jewish Bible' },
    { id: 'TOJB', name: 'The Orthodox Jewish Bible' },
    { id: 'NEG', name: 'Ga (NEGAB)' },
  ],
  setBook: (book) => set({ currentBook: book, chapter: 1 }),
  setChapter: (chapter) => set({ chapter }),
  setVersions: (primary, parallel) =>
    set((state) => ({
      primaryVersion: primary ?? state.primaryVersion,
      parallelVersion: parallel ?? state.parallelVersion,
    })),
  toggleParallel: () => set((state) => ({ isParallel: !state.isParallel })),
  setAvailableVersions: (versions) => set({ availableVersions: versions }),
  nextChapter: (maxChapters) =>
    set((state) => ({
      chapter: state.chapter < maxChapters ? state.chapter + 1 : state.chapter,
    })),
  prevChapter: () =>
    set((state) => ({
      chapter: state.chapter > 1 ? state.chapter - 1 : state.chapter,
    })),
}));
