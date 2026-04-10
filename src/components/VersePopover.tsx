import { useEffect, useRef, useState } from 'react';
import { Headphones, Loader2, X } from 'lucide-react';
import { getSpurgeonCommentary, getStrongDefinition } from '../services/studyData';
import { CommentarySnippet, StrongDefinition } from '../types/bible';
import { useAudioStore } from '../stores/audioStore';
import { useBibleStore } from '../stores/bibleStore';

interface VersePopoverProps {
  verseNum: number;
  position: { x: number; y: number };
  onClose: () => void;
}

type TabId = 'commentary' | 'strongs' | 'audio';

export default function VersePopover({ verseNum, position, onClose }: VersePopoverProps) {
  const { currentBook, chapter } = useBibleStore();
  const { loadPassage, setCurrentTime } = useAudioStore();
  const [activeTab, setActiveTab] = useState<TabId>('commentary');
  const [commentary, setCommentary] = useState<string[] | null>(null);
  const [strongsData, setStrongsData] = useState<StrongDefinition | null>(null);
  const [strongsLoading, setStrongsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    if (activeTab === 'commentary') {
      setCommentary(null);
      if (currentBook.toUpperCase() === 'PSA') {
        getSpurgeonCommentary(currentBook, chapter, verseNum)
          .then((results: CommentarySnippet[]) => {
            if (results.length > 0) {
              setCommentary(results.map((r) => r.text));
            } else {
              setCommentary(['No commentary available for this verse.']);
            }
          })
          .catch(() => setCommentary(['No commentary available for this verse.']));
      } else {
        setCommentary(['Spurgeon commentary is available for Psalms.\nCheck the Strong\'s tab for word studies.']);
      }
    }
  }, [activeTab, currentBook, chapter, verseNum]);

  async function loadStrongs() {
    setStrongsLoading(true);
    setStrongsData(null);
    try {
      const def = await getStrongDefinition('greek', 'G2424');
      setStrongsData(def);
    } catch {
      setStrongsData(null);
    } finally {
      setStrongsLoading(false);
    }
  }

  function handlePlayAudio() {
    loadPassage(currentBook, chapter, '');
    setCurrentTime(0);
    setActiveTab('audio');
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'commentary', label: 'Commentary' },
    { id: 'strongs', label: "Strong's" },
    { id: 'audio', label: 'Audio' },
  ];

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden"
      style={{
        left: Math.min(position.x, window.innerWidth - 300),
        top: Math.min(position.y, window.innerHeight - 350),
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-200">
        <span className="text-sm font-semibold text-stone-700">
          {currentBook} {chapter}:{verseNum}
        </span>
        <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      <div className="flex border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'strongs' && !strongsData) loadStrongs();
            }}
            className={`flex-1 text-xs font-medium py-2 transition-colors ${
              activeTab === tab.id
                ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-64 overflow-y-auto">
        {activeTab === 'commentary' && (
          <div>
            {commentary === null ? (
              <div className="flex items-center gap-2 text-stone-500 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading commentary...
              </div>
            ) : (
              commentary.map((text, i) => (
                <p key={i} className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {text}
                </p>
              ))
            )}
          </div>
        )}

        {activeTab === 'strongs' && (
          <div>
            {strongsLoading ? (
              <div className="flex items-center gap-2 text-stone-500 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up words...
              </div>
            ) : strongsData ? (
              <div className="space-y-2">
                <div className="p-2 bg-stone-50 rounded border border-stone-200">
                  <p className="text-sm font-semibold text-stone-800">
                    {strongsData.strongsNumber} - {strongsData.lemma}
                  </p>
                  <p className="text-xs text-stone-500">{strongsData.pronunciation}</p>
                  <p className="text-sm text-stone-700 mt-1">{strongsData.definition}</p>
                  <p className="text-xs text-stone-500 mt-1">{strongsData.partOfSpeech}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-3">
                Tap individual words in the future to look up Strong&apos;s numbers.
                <br />
                Showing sample entry for G2424 (Iesous).
              </p>
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="text-center py-4">
            <p className="text-sm text-stone-600 mb-4">Listen to this verse in audio</p>
            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors mx-auto"
            >
              <Headphones className="w-4 h-4" />
              Play Audio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
