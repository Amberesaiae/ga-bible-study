import { useEffect, useState } from 'react';
import { useBibleStore } from '../stores/bibleStore';
import { fetchVerses } from '../services';

interface Verse {
  verse_start: number;
  verse_end: number;
  verse_text: string;
}

interface Props {
  highlightedVerse: number | null;
  onVerseClick: (verseNum: number, e?: React.MouseEvent) => void;
}

export default function BibleReader({ highlightedVerse, onVerseClick }: Props) {
  const { currentBook, chapter, primaryVersion, isParallel } = useBibleStore();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [parallelVerses, setParallelVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVerses(currentBook, chapter, primaryVersion);
        setVerses(data);
        if (isParallel) {
          const parallel = await fetchVerses(currentBook, chapter, 'KJV');
          setParallelVerses(parallel);
        }
      } catch (err) {
        setError('Failed to load verses. Please check your API key and try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentBook, chapter, primaryVersion, isParallel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">Loading scripture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="mb-2 font-medium">Error loading verses</p>
        <p className="text-sm text-stone-500">{error}</p>
      </div>
    );
  }

  if (!verses.length) {
    return (
      <div className="p-8 text-center text-stone-400">
        <p>No verses found for this chapter.</p>
      </div>
    );
  }

  return (
    <div className={`px-4 py-6 ${isParallel ? 'grid grid-cols-2 gap-6' : ''}`}>
      {/* Primary column */}
      <div className="space-y-1">
        {isParallel && (
          <h3 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4 pb-2 border-b border-stone-200">
            {primaryVersion}
          </h3>
        )}
        {verses.map((v) => (
          <p
            key={v.verse_start}
            onClick={(e) => onVerseClick(v.verse_start, e)}
            className={`text-stone-800 leading-relaxed py-1.5 px-2 rounded cursor-pointer hover:bg-stone-100 transition-colors text-base ${
              highlightedVerse === v.verse_start
                ? 'bg-amber-50 border-l-4 border-amber-400 pl-3'
                : ''
            }`}
          >
            <sup className="text-[0.65rem] text-stone-400 font-bold mr-1.5 select-none">
              {v.verse_start}
            </sup>
            {v.verse_text}
          </p>
        ))}
      </div>

      {/* Parallel column */}
      {isParallel && (
        <div className="space-y-1 border-l border-stone-200 pl-6">
          <h3 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4 pb-2 border-b border-stone-200">
            KJV (English)
          </h3>
          {parallelVerses.map((v) => (
            <p
              key={v.verse_start}
              className={`text-stone-700 leading-relaxed py-1.5 px-2 rounded text-base ${
                highlightedVerse === v.verse_start ? 'bg-amber-50' : ''
              }`}
            >
              <sup className="text-[0.65rem] text-stone-400 font-bold mr-1.5 select-none">
                {v.verse_start}
              </sup>
              {v.verse_text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
