import { useState } from 'react';
import { ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import { useBibleStore } from '../stores/bibleStore';
import BibleReader from './BibleReader';
import VersePopover from './VersePopover';

// Book options for the dropdown
const BOOKS = [
  { id: 'GEN', name: 'Genesis' }, { id: 'EXO', name: 'Exodus' }, { id: 'LEV', name: 'Leviticus' },
  { id: 'NUM', name: 'Numbers' }, { id: 'DEU', name: 'Deuteronomy' }, { id: 'JOS', name: 'Joshua' },
  { id: 'JDG', name: 'Judges' }, { id: 'RUT', name: 'Ruth' }, { id: '1SA', name: '1 Samuel' },
  { id: '2SA', name: '2 Samuel' }, { id: '1KI', name: '1 Kings' }, { id: '2KI', name: '2 Kings' },
  { id: '1CH', name: '1 Chronicles' }, { id: '2CH', name: '2 Chronicles' }, { id: 'EZR', name: 'Ezra' },
  { id: 'NEH', name: 'Nehemiah' }, { id: 'EST', name: 'Esther' }, { id: 'JOB', name: 'Job' },
  { id: 'PSA', name: 'Psalms' }, { id: 'PRO', name: 'Proverbs' }, { id: 'ECC', name: 'Ecclesiastes' },
  { id: 'SNG', name: 'Song of Solomon' }, { id: 'ISA', name: 'Isaiah' }, { id: 'JER', name: 'Jeremiah' },
  { id: 'LAM', name: 'Lamentations' }, { id: 'EZK', name: 'Ezekiel' }, { id: 'DAN', name: 'Daniel' },
  { id: 'HOS', name: 'Hosea' }, { id: 'JOL', name: 'Joel' }, { id: 'AMO', name: 'Amos' },
  { id: 'OBA', name: 'Obadiah' }, { id: 'JON', name: 'Jonah' }, { id: 'MIC', name: 'Micah' },
  { id: 'NAM', name: 'Nahum' }, { id: 'HAB', name: 'Habakkuk' }, { id: 'ZEP', name: 'Zephaniah' },
  { id: 'HAG', name: 'Haggai' }, { id: 'ZEC', name: 'Zechariah' }, { id: 'MAL', name: 'Malachi' },
  { id: 'MAT', name: 'Matthew' }, { id: 'MRK', name: 'Mark' }, { id: 'LUK', name: 'Luke' },
  { id: 'JHN', name: 'John' }, { id: 'ACT', name: 'Acts' }, { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' }, { id: '2CO', name: '2 Corinthians' }, { id: 'GAL', name: 'Galatians' },
  { id: 'EPH', name: 'Ephesians' }, { id: 'PHP', name: 'Philippians' }, { id: 'COL', name: 'Colossians' },
  { id: '1TH', name: '1 Thessalonians' }, { id: '2TH', name: '2 Thessalonians' }, { id: '1TI', name: '1 Timothy' },
  { id: '2TI', name: '2 Timothy' }, { id: 'TIT', name: 'Titus' }, { id: 'PHM', name: 'Philemon' },
  { id: 'HEB', name: 'Hebrews' }, { id: 'JAS', name: 'James' }, { id: '1PE', name: '1 Peter' },
  { id: '2PE', name: '2 Peter' }, { id: '1JN', name: '1 John' }, { id: '2JN', name: '2 John' },
  { id: '3JN', name: '3 John' }, { id: 'JUD', name: 'Jude' }, { id: 'REV', name: 'Revelation' },
];

export default function ReaderPage() {
  const {
    currentBook, chapter, primaryVersion, isParallel,
    availableVersions, setBook, setChapter, setVersions, toggleParallel, nextChapter, prevChapter,
  } = useBibleStore();

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  function handleVerseClick(verseNum: number, e?: React.MouseEvent) {
    if (selectedVerse === verseNum) {
      setSelectedVerse(null);
      return;
    }
    setSelectedVerse(verseNum);
    if (e) {
      setPopoverPos({ x: e.clientX + 12, y: e.clientY - 10 });
    }
  }

  const getChapterCount = (bookId: string): number => {
    if (bookId === 'PSA') return 150;
    if (['GEN', 'EXO'].includes(bookId)) return 50;
    if (bookId === 'LEV') return 27;
    if (bookId === 'NUM') return 36;
    if (bookId === 'DEU') return 34;
    if (bookId === 'MAT') return 28;
    if (bookId === 'MRK') return 16;
    if (bookId === 'LUK') return 24;
    if (bookId === 'JHN') return 21;
    if (bookId === 'ACT') return 28;
    if (bookId === 'ROM') return 16;
    if (['1CO', 'REV'].includes(bookId)) return 22;
    if (bookId === 'ISA') return 66;
    if (bookId === 'JER') return 52;
    if (bookId === 'EZK') return 48;
    return 40;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Toolbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 flex-wrap">
            {/* Book selector */}
            <div className="relative">
              <select
                value={currentBook}
                onChange={(e) => setBook(e.target.value)}
                className="appearance-none bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-sm font-medium rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              >
                {BOOKS.map((book) => (
                  <option key={book.id} value={book.id}>{book.name}</option>
                ))}
              </select>
              <ChevronLeft className="w-4 h-4 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 rotate-180 pointer-events-none" />
            </div>

            {/* Chapter navigation */}
            <div className="flex items-center bg-stone-100 rounded-lg border border-stone-300 overflow-hidden">
              <button
                onClick={() => prevChapter()}
                disabled={chapter <= 1}
                className="p-2 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={chapter}
                onChange={(e) => setChapter(Number(e.target.value))}
                className="appearance-none bg-transparent text-sm font-semibold text-stone-800 px-2 py-2 focus:ring-0 cursor-pointer min-w-[3rem] text-center"
              >
                {Array.from({ length: getChapterCount(currentBook) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} className="text-center">{n}</option>
                ))}
              </select>
              <button
                onClick={() => nextChapter(getChapterCount(currentBook))}
                disabled={chapter >= getChapterCount(currentBook)}
                className="p-2 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1" />

            {/* Version dropdown */}
            <select
              value={primaryVersion}
              onChange={(e) => setVersions(e.target.value)}
              className="appearance-none bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-sm font-medium rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {availableVersions.filter((v) => v.id !== 'NEG').map((v) => (
                <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
              ))}
            </select>

            {/* Parallel toggle */}
            <button
              onClick={toggleParallel}
              className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-2 border transition-colors ${
                isParallel
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200'
              }`}
              title="Toggle parallel Ga translation"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">{isParallel ? 'Parallel On' : 'Parallel'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bible Reader content */}
      <main className="max-w-6xl mx-auto">
        <BibleReader highlightedVerse={selectedVerse} onVerseClick={handleVerseClick} />
      </main>

      {/* Verse Popover */}
      {selectedVerse !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedVerse(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VersePopover
              verseNum={selectedVerse}
              position={popoverPos}
              onClose={() => setSelectedVerse(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
