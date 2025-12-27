import { useState, useRef, useEffect, useCallback } from "react";

const STREAM_URL = "https://vrs-blackbox.ddns.net/listen/vrs/radio.mp3";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  analyser: AnalyserNode | null;
  togglePlay: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const previousVolume = useRef(0.7);

  const BUFFER_THRESHOLD = 30; // 30 seconds buffer
  const bufferCheckIntervalRef = useRef<number | null>(null);
  const isBufferingRef = useRef(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    
    audioRef.current = audio;

    const getBufferedAmount = () => {
      if (audio.buffered.length > 0) {
        return audio.buffered.end(audio.buffered.length - 1) - audio.currentTime;
      }
      return 0;
    };

    const handleCanPlay = () => {
      // Only stop loading if we have enough buffer
      const buffered = getBufferedAmount();
      if (buffered >= BUFFER_THRESHOLD || !isBufferingRef.current) {
        setIsLoading(false);
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleProgress = () => {
      const buffered = getBufferedAmount();
      console.log(`Buffer: ${buffered.toFixed(1)}s`);
      
      // If we're initially buffering and have enough, start playing
      if (isBufferingRef.current && buffered >= BUFFER_THRESHOLD) {
        isBufferingRef.current = false;
        setIsLoading(false);
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("progress", handleProgress);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", handleProgress);
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }
      audio.pause();
      audio.src = "";
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const setupAudioAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Create AudioContext only if not already created
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;

    // Create source only if not already created
    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audio);
    }

    // Create analyser
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
      
      setAnalyser(analyserRef.current);
    }

    // Resume context if suspended
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = "";
      isBufferingRef.current = false;
    } else {
      setIsLoading(true);
      isBufferingRef.current = true;
      audio.src = STREAM_URL;
      audio.load();
      
      // Setup audio analyser before playing
      setupAudioAnalyser();
      
      // Don't play immediately - wait for buffer via progress event
      console.log("Buffering 30 seconds before playback...");
    }
  }, [isPlaying, setupAudioAnalyser]);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    previousVolume.current = value;
    if (value > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    analyser,
    togglePlay,
    setVolume,
    toggleMute,
  };
};
