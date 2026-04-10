import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { getPlayableAudioUrl, getVerseTiming, getFilesetId } from '../services/biblebrain';

type Timing = { verse_num: number; end_time: number };

/**
 * Custom hook that manages an HTMLAudioElement and synchronizes
 * playback time with verse highlighting in the Bible reader.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSetupRef = useRef(false);
  const timingsRef = useRef<Timing[]>([]);

  // Read store state needed for playback sync
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const isLoading = useAudioStore((s) => s.isLoading);
  const error = useAudioStore((s) => s.error);
  const currentBook = useAudioStore((s) => s.currentBook);
  const currentChapter = useAudioStore((s) => s.currentChapter);
  const storeFilesetId = useAudioStore((s) => s.filesetId);

  // Selectors for actions (stable references)
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const setDuration = useAudioStore((s) => s.setDuration);
  const setHighlightedVerse = useAudioStore((s) => s.setHighlightedVerse);
  const setError = useAudioStore((s) => s.setError);
  const setLoading = useAudioStore((s) => s.setLoading);

  // Create the audio element once
  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    const el = new Audio();
    el.preload = 'metadata';
    audioRef.current = el;

    el.addEventListener('loadedmetadata', () => {
      setDuration(el.duration);
      setLoading(false);
    });

    el.addEventListener('durationchange', () => {
      if (el.duration && isFinite(el.duration)) {
        setDuration(el.duration);
      }
    });

    el.addEventListener('timeupdate', () => {
      const time = el.currentTime;
      setCurrentTime(time);

      const timings = timingsRef.current;
      if (timings.length === 0) return;

      let currentVerseNum: number | null = null;
      for (let i = 0; i < timings.length; i++) {
        const prevEnd = i > 0 ? timings[i - 1].end_time : 0;
        if (time >= prevEnd && time < timings[i].end_time) {
          currentVerseNum = timings[i].verse_num;
          break;
        }
        if (i === timings.length - 1 && time >= timings[i].end_time) {
          currentVerseNum = timings[i].verse_num;
        }
      }
      setHighlightedVerse(currentVerseNum);
    });

    el.addEventListener('ended', () => {
      setHighlightedVerse(null);
      useAudioStore.getState().togglePlayback();
    });

    el.addEventListener('error', () => {
      setError('Failed to load audio. Check your connection or try another passage.');
      setLoading(false);
    });

    return () => {
      el.pause();
      el.src = '';
      audioRef.current = null;
      isSetupRef.current = false;
    };
  }, []);

  // Load audio when passage changes
  useEffect(() => {
    if (!currentBook || !currentChapter) return;

    let cancelled = false;

    async function loadAudio() {
      const book = currentBook!;
      const ch = currentChapter!;
      setLoading(true);
      setError(null);
      setHighlightedVerse(null);

      // Resolve filesetId
      const fsId = storeFilesetId ?? await getFilesetId('gaa');
      if (cancelled) return;
      useAudioStore.setState({ filesetId: fsId });

      const playableUrl = await getPlayableAudioUrl(fsId, book, ch);
      if (cancelled) return;

      if (!playableUrl) {
        setError('Audio not available for this passage.');
        setLoading(false);
        return;
      }

      useAudioStore.setState({ audioUrl: playableUrl });

      const timings = await getVerseTiming(fsId, book, ch);
      if (!cancelled) {
        timingsRef.current = timings;
        useAudioStore.setState({ verseTimings: timings });

        const wasPlaying = useAudioStore.getState().isPlaying;
        if (wasPlaying && audioRef.current) {
          await audioRef.current.play();
        }
      }
    }

    loadAudio();
    return () => { cancelled = true; };
  }, [currentBook, currentChapter, storeFilesetId]);

  // Sync playback state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Seek helpers
  const seekTo = useCallback((time: number) => {
    const el = audioRef.current;
    if (!el?.duration) return;
    el.currentTime = Math.max(0, Math.min(time, el.duration));
    setCurrentTime(el.currentTime);
  }, []);

  const skip = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el?.duration) return;
    el.currentTime = Math.max(0, Math.min(el.currentTime + seconds, el.duration));
    setCurrentTime(el.currentTime);
  }, []);

  const jumpToVerse = useCallback((verseNum: number) => {
    const el = audioRef.current;
    const timings = timingsRef.current;
    if (!el?.duration || timings.length === 0) return;

    const idx = timings.findIndex((t) => t.verse_num === verseNum);
    if (idx >= 0) {
      const startTime = idx > 0 ? timings[idx - 1].end_time : 0;
      el.currentTime = startTime;
      setCurrentTime(startTime);
    }
  }, []);

  return { audio: audioRef.current, seekTo, skip, jumpToVerse, isLoading, error };
}
