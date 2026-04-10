import { Play, Pause, SkipBack, SkipForward, Volume2, FastForward, AlertCircle, Loader2 } from 'lucide-react';
import { useAudioStore } from '../stores/audioStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

/** Format seconds as MM:SS */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const {
    isPlaying,
    playbackRate,
    currentTime,
    duration,
    currentPassage,
    isLoading,
    error,
    togglePlayback,
    setPlaybackRate,
    setCurrentTime,
  } = useAudioStore();

  const { seekTo, skip } = useAudioPlayer();

  // Progress percentage (0-100)
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (isFinite(value) && duration > 0) {
      const seekTime = (value / 100) * duration;
      setCurrentTime(seekTime);
      seekTo(seekTime);
    }
  }

  function handleSkipBack() {
    skip(-10);
  }

  function handleSkipForward() {
    skip(10);
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1e3a5f] text-white shadow-2xl border-t border-[#c8a45a]/30 px-4 py-3 z-50">
      {/* Error banner */}
      {error && (
        <div className="mb-2 flex items-center gap-2 text-red-300 text-xs bg-red-900/30 rounded px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Main row */}
        <div className="flex items-center gap-3">
          {/* Playback controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSkipBack}
              disabled={isLoading}
              className="p-1.5 hover:text-[#c8a45a] disabled:opacity-40 transition-colors"
              title="Back 10s"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlayback}
              disabled={isLoading || !currentPassage}
              className="p-2 bg-[#c8a45a] rounded-full hover:bg-[#b8944a] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#1e3a5f] animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-[#1e3a5f]" />
              ) : (
                <Play className="w-5 h-5 text-[#1e3a5f]" />
              )}
            </button>
            <button
              onClick={handleSkipForward}
              disabled={isLoading}
              className="p-1.5 hover:text-[#c8a45a] disabled:opacity-40 transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Passage label */}
          <div className="flex-1 min-w-0 text-sm truncate">
            {currentPassage ? (
              <span className="font-medium">{currentPassage} &mdash; Ga Audio</span>
            ) : (
              <span className="text-white/50">Select a passage to play audio</span>
            )}
          </div>

          {/* Time display */}
          <div className="text-xs font-mono text-white/70 tabular-nums shrink-0">
            {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
          </div>

          {/* Speed toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-white/50" />
            <button
              onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono transition-colors"
              title="Playback speed"
            >
              <FastForward className="w-3 h-3" /> {playbackRate}x
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            disabled={isLoading || duration === 0}
            className="flex-1 h-1.5 accent-[#c8a45a] cursor-pointer disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #c8a45a 0%, #c8a45a ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`,
            }}
            title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          />
        </div>
      </div>
    </footer>
  );
}
