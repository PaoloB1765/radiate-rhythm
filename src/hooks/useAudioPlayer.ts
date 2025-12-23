import { useState, useRef, useEffect, useCallback } from "react";

const STREAM_URL = "https://vrs-blackbox.ddns.net/listen/vrs/radio.mp3";
const BUFFER_SECONDS = 60;

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
  const bufferCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const checkBufferAndPlay = useCallback((audio: HTMLAudioElement) => {
    // Clear any existing interval
    if (bufferCheckInterval.current) {
      clearInterval(bufferCheckInterval.current);
    }

    bufferCheckInterval.current = setInterval(() => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const currentTime = audio.currentTime;
        const bufferedSeconds = bufferedEnd - currentTime;

        console.log(`Buffered: ${bufferedSeconds.toFixed(1)}s / ${BUFFER_SECONDS}s`);

        if (bufferedSeconds >= BUFFER_SECONDS) {
          clearInterval(bufferCheckInterval.current!);
          bufferCheckInterval.current = null;
          audio.play().catch((error) => {
            console.error("Playback failed:", error);
            setIsLoading(false);
          });
        }
      }
    }, 500);

    // Fallback: start playing after 10 seconds even if buffer isn't full
    // (for live streams that may not buffer as expected)
    setTimeout(() => {
      if (bufferCheckInterval.current) {
        clearInterval(bufferCheckInterval.current);
        bufferCheckInterval.current = null;
        if (audio.paused && audio.src) {
          console.log("Buffer timeout - starting playback");
          audio.play().catch((error) => {
            console.error("Playback failed:", error);
            setIsLoading(false);
          });
        }
      }
    }, 10000);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleCanPlay = () => {
      // Don't set loading to false yet - wait for buffer
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

    const handleStalled = () => {
      console.log("Audio stalled - attempting to recover");
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
      audio.pause();
      audio.src = "";
      if (bufferCheckInterval.current) {
        clearInterval(bufferCheckInterval.current);
      }
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
      if (bufferCheckInterval.current) {
        clearInterval(bufferCheckInterval.current);
        bufferCheckInterval.current = null;
      }
    } else {
      setIsLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      
      // Setup audio analyser before playing
      setupAudioAnalyser();
      
      // Start buffer check - will play when 60s buffered or after timeout
      checkBufferAndPlay(audio);
    }
  }, [isPlaying, setupAudioAnalyser, checkBufferAndPlay]);

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
