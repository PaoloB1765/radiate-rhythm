import { useState, useRef, useEffect, useCallback } from "react";

const STREAM_URL = "https://vrs-blackbox.ddns.net/listen/vrs/radio.mp3";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(0.7);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoading(false);
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

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = "";
    } else {
      setIsLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      audio.play().catch((error) => {
        console.error("Playback failed:", error);
        setIsLoading(false);
      });
    }
  }, [isPlaying]);

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
    togglePlay,
    setVolume,
    toggleMute,
  };
};
