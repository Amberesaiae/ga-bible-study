import { useEffect, useState, useRef, useCallback } from 'react';
import { BibleChapter, BibleVerse } from '../types/bible';
import { useBibleStore } from '../stores/bibleStore';
import { useAudioStore } from '../stores/audioStore';
import { getChapterContent } from '../services/youversion';
import { getFilesetId } from '../services/biblebrain';

interface BibleReaderProps {
  highlightedVerse?: number | null;
  onVerseClick?: (verseNum: number, e?: React.MouseEvent) => void;
}

export default function BibleReader({ highlightedVerse, onVerseClick }: BibleReaderProps) {
  const { currentBook, chapter, primaryVersion, parallelVersion, isParallel } = useBibleStore();
  const [primaryChapter, setPrimaryChapter] = useState<BibleChapter | null>(null);
  const [parallelChapter, setParallelChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to highlightedVerse from audio store for audio sync
  const audioHighlightedVerse = useAudioStore((s) => s.highlightedVerse);

  // Refs for auto-scrolling highlighted verses
  const verseRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // The effective highlighted verse: prefer audio highlight, fall back to manual click
  const effectiveHighlighted = audioHighlightedVerse ?? highlightedVerse ?? null;

  // Auto-scroll to the highlighted verse when audio plays
  useEffect(() => {
    if (effectiveHighlighted === null) return;

    const el = verseRefs.current.get(effectiveHighlighted);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [effectiveHighlighted]);

  // Load audio passage when reader navigates to a new book/chapter
  const loadAudioPassage = useCallback(async (book: string, ch: number) => {
    const { loadPassage } = useAudioStore.getState();
    if (!book || ch < 1) return;

    try {
      const fsId = await getFilesetId('gaa');
      loadPassage(book, ch, fsId);
    } catch {
      // Audio load is non-blocking; errors are handled in the hook
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Load audio for the new passage in the background
    loadAudioPassage(currentBook, chapter);

    async function fetchChapter(versionId: string, book: string, ch: number): Promise<BibleChapter | null> {
      try {
        const data = await getChapterContent(versionId, book, ch);
        return data;
      } catch {
        return null;
      }
    }

    async function load() {
      const [primary, parallel] = await Promise.allSettled([
        fetchChapter(primaryVersion, currentBook, chapter),
        isParallel ? fetchChapter(parallelVersion, currentBook, chapter) : Promise.resolve(null),
      ]);

      if (!cancelled) {
        if (primary.status === 'fulfilled' && primary.value) {
          setPrimaryChapter(primary.value);
        } else {
          setError(`Failed to load ${primaryVersion} ${currentBook} ${chapter}`);
        }
        if (parallel.status === 'fulfilled') {
          setParallelChapter(parallel.value);
        }
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentBook, chapter, primaryVersion, parallelVersion, isParallel, loadAudioPassage]);

  // Register a verse ref for scroll target
  const registerVerseRef = useCallback((verseNum: number, el: HTMLSpanElement | null) => {
    if (el) {
      verseRefs.current.set(verseNum, el);
    } else {
      verseRefs.current.delete(verseNum);
    }
  }, []);

  function renderVerses(chapterData: BibleChapter, versionLabel: string) {
    return (
      <div className="flex-1" ref={scrollContainerRef}>
        {versionLabel && (
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 mb-3">
            {versionLabel}
          </h3>
        )}
        <div className="space-y-2 font-serif text-lg leading-relaxed text-stone-800">
          {chapterData.verses.map((verse: BibleVerse) => {
            const isHighlighted = effectiveHighlighted !== null && verse.number === effectiveHighlighted;
            return (
              <span
                key={verse.number}
                ref={(el) => registerVerseRef(verse.number, el)}
                data-verse={verse.number}
                role="button"
                tabIndex={0}
                onClick={(e) => onVerseClick?.(verse.number, e)}
                onKeyDown={(e) => { if (e.key === 'Enter') onVerseClick?.(verse.number); }}
                className={`cursor-pointer rounded px-0.5 py-0.5 transition-colors duration-200 ${
                  isHighlighted
                    ? 'bg-yellow-200 ring-1 ring-yellow-400'
                    : 'hover:bg-stone-100'
                }`}
              >
                <sup className="text-xs font-sans text-stone-400 mr-1 select-none">
                  {verse.number}
                </sup>
                {verse.text}{' '}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !primaryChapter) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="text-lg">{error || 'Chapter not found'}</p>
        <p className="text-sm mt-2">Try selecting a different book or chapter.</p>
      </div>
    );
  }

  const bookName = primaryChapter.verses[0]?.ref?.split(' ')[0] || currentBook;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center font-serif">
        {bookName} {primaryChapter.number}
      </h2>

      {isParallel && parallelChapter ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderVerses(primaryChapter, primaryVersion)}
          <div className="hidden md:block w-px bg-stone-200" />
          {renderVerses(parallelChapter, `${parallelVersion} (Ga)`)}
        </div>
      ) : (
        renderVerses(primaryChapter, '')
      )}
    </div>
  );
}
