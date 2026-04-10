import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useBibleStore } from '../stores/bibleStore';
import { fetchAudioUrl } from '../services';

export default function AudioPlayer() {
  const { currentBook, chapter } = useBibleStore();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const load = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      try {
        const url = await fetchAudioUrl(currentBook, chapter);
        setAudioUrl(url);
      } catch {
        setAudioUrl(null);
      }
    };
    load();
  }, [currentBook, chapter]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e3a5f] text-white px-4 py-3 shadow-lg z-50">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <button onClick={togglePlay} className="p-2 rounded-full hover:bg-white/20 transition-colors">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <span className="text-xs text-white/70 min-w-[3rem]">{formatTime(currentTime)}</span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 accent-[#c8a45a] cursor-pointer"
        />

        <span className="text-xs text-white/70 min-w-[3rem] text-right">{formatTime(duration)}</span>

        <button onClick={toggleMute} className="p-2 rounded-full hover:bg-white/20 transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
