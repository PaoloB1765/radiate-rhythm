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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isPlayingRef = useRef(false);
  const isIntentionalStop = useRef(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlaybackTime = useRef<number>(0);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    
    // Ottimizzazioni per la riproduzione in background su mobile
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    // Disabilita il buffering aggressivo per ridurre gli skip
    if ('mozPreservesPitch' in audio) {
      (audio as any).mozPreservesPitch = false;
    }
    
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoading(false);
      reconnectAttempts.current = 0;
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      reconnectAttempts.current = 0;
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Don't reconnect if this was an intentional stop
      if (isIntentionalStop.current) {
        isIntentionalStop.current = false;
        return;
      }
      
      // Tenta di riconnettersi automaticamente in caso di errore
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`Tentativo di riconnessione ${reconnectAttempts.current}/${maxReconnectAttempts}`);
        setTimeout(() => {
          if (audioRef.current && isPlayingRef.current) {
            audioRef.current.src = STREAM_URL + "?t=" + Date.now();
            audioRef.current.load();
            audioRef.current.play().catch(console.error);
          }
        }, 1000 * reconnectAttempts.current);
      }
    };

    // Gestione stallo audio (comune quando lo schermo si spegne)
    const handleStalled = () => {
      console.log("Audio stalled, attempting recovery...");
      if (audio && isPlayingRef.current && !isIntentionalStop.current) {
        // Forza un refresh dello stream
        audio.src = STREAM_URL + "?t=" + Date.now();
        audio.load();
        audio.play().catch(console.error);
      }
    };

    // Heartbeat: controlla ogni 60 secondi se l'audio è ancora attivo (aumentato da 30s per risparmio batteria)
    const startHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(() => {
        if (!isPlayingRef.current || isIntentionalStop.current) return;
        
        const currentTime = audio.currentTime;
        
        // Se l'audio dovrebbe suonare ma currentTime non cambia o è in pausa
        if (audio.paused && isPlayingRef.current && !isIntentionalStop.current) {
          console.log("Heartbeat: Audio paused unexpectedly, restarting...");
          audio.src = STREAM_URL + "?t=" + Date.now();
          audio.load();
          audio.play().catch(console.error);
        }
        
        // Se currentTime non cambia per 2 cicli consecutivi (potrebbe essere bloccato)
        if (lastPlaybackTime.current === currentTime && !audio.paused && currentTime > 0) {
          console.log("Heartbeat: Audio stuck, attempting recovery...");
          audio.src = STREAM_URL + "?t=" + Date.now();
          audio.load();
          audio.play().catch(console.error);
        }
        
        lastPlaybackTime.current = currentTime;
        
        // Mantieni l'AudioContext attivo
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume().catch(console.error);
        }
      }, 60000); // Ogni 60 secondi (aumentato da 30s per risparmio batteria)
    };

    startHeartbeat();

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    // Gestione visibilità pagina per riprendere l'audio
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Se l'app torna visibile e l'audio dovrebbe essere in riproduzione
      if (document.visibilityState === 'visible' && isPlayingRef.current && audio.paused) {
        audio.play().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
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

  // Autoplay on mount
  useEffect(() => {
    const attemptAutoplay = () => {
      const audio = audioRef.current;
      if (!audio || isPlaying) return;

      setIsLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      
      setupAudioAnalyser();
      
      audio.play().catch((error) => {
        console.warn("Autoplay blocked by browser:", error);
        setIsLoading(false);
      });
    };

    // Small delay to ensure everything is initialized
    const timer = setTimeout(attemptAutoplay, 100);
    return () => clearTimeout(timer);
  }, []);

  const setupAudioAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Create AudioContext only if not already created
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({
        // Latenza bassa per ridurre gli skip
        latencyHint: 'playback'
      });
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
      isIntentionalStop.current = true;
      audio.pause();
      audio.src = "";
    } else {
      setIsLoading(true);
      reconnectAttempts.current = 0;
      audio.src = STREAM_URL;
      audio.load();
      
      // Setup audio analyser before playing
      setupAudioAnalyser();
      
      audio.play().catch((error) => {
        console.error("Playback failed:", error);
        setIsLoading(false);
      });
    }
  }, [isPlaying, setupAudioAnalyser, volume, isMuted]);

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
