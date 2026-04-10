import { X } from 'lucide-react';
import { useBibleStore } from '../stores/bibleStore';
import { getStudyNote } from '../services/studyData';

interface Props {
  verseNum: number;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function VersePopover({ verseNum, position, onClose }: Props) {
  const { currentBook, chapter } = useBibleStore();
  const note = getStudyNote(currentBook, chapter, verseNum);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 280),
    zIndex: 50,
  };

  return (
    <div
      style={style}
      className="bg-white rounded-xl shadow-2xl border border-stone-200 w-72 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1e3a5f]">
          Verse {verseNum} — Study Notes
        </h3>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {note ? (
        <div className="space-y-3">
          {note.commentary && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Commentary</h4>
              <p className="text-sm text-stone-700 leading-relaxed">{note.commentary}</p>
            </div>
          )}
          {note.crossReferences && note.crossReferences.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Cross References</h4>
              <ul className="space-y-0.5">
                {note.crossReferences.map((ref, i) => (
                  <li key={i} className="text-xs text-[#1e3a5f] font-medium">{ref}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-stone-400 italic">No study notes available for this verse.</p>
      )}
    </div>
  );
}
