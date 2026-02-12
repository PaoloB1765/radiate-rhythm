import { useState, useEffect, useCallback, useRef } from "react";

interface SongHistoryItem {
  artist: string;
  title: string;
  coverArt: string;
  playedAt: number;
}

interface NowPlayingData {
  artist: string;
  title: string;
  album: string;
  coverArt: string;
  duration: number;
  elapsed: number;
  playedAt: number;
  nextArtist: string;
  nextCoverArt: string;
  nextTitle: string;
  songHistory: SongHistoryItem[];
}

const NOW_PLAYING_URL = "https://vrs-blackbox.ddns.net/api/nowplaying/vrs";

export const useNowPlaying = (isPlaying: boolean) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>({
    artist: "",
    title: "",
    album: "",
    coverArt: "",
    duration: 0,
    elapsed: 0,
    playedAt: 0,
    nextArtist: "",
    nextTitle: "",
    nextCoverArt: "",
    songHistory: [],
  });
  
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const playedAtRef = useRef(0);
  const durationRef = useRef(0);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const response = await fetch(NOW_PLAYING_URL);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      // AzuraCast API structure
      const nowPlayingTrack = data.now_playing?.song;
      const elapsed = data.now_playing?.elapsed || 0;
      const duration = data.now_playing?.duration || 0;
      const playedAt = data.now_playing?.played_at || 0;
      
      playedAtRef.current = playedAt;
      durationRef.current = duration;
      
      // Next song info from AzuraCast API
      const nextSong = data.playing_next?.song;
      
      // Song history from AzuraCast API (last 15 songs)
      const historyData = data.song_history || [];
      const songHistory: SongHistoryItem[] = historyData.slice(0, 15).map((item: any) => ({
        artist: item.song?.artist || "",
        title: item.song?.title || "",
        coverArt: item.song?.art || "",
        playedAt: item.played_at || 0,
      }));
      
      if (nowPlayingTrack) {
        setNowPlaying({
          artist: nowPlayingTrack.artist || "",
          title: nowPlayingTrack.title || "",
          album: nowPlayingTrack.album || "",
          coverArt: nowPlayingTrack.art || data.now_playing?.song?.art || "",
          duration,
          elapsed,
          playedAt,
          nextArtist: nextSong?.artist || "",
          nextTitle: nextSong?.title || "",
          nextCoverArt: nextSong?.art || "",
          songHistory,
        });
        setCurrentElapsed(elapsed);
      }
    } catch (error) {
      console.error("Error fetching now playing:", error);
    }
  }, []);

  // Update elapsed time every second - pause when page not visible
  useEffect(() => {
    if (!isPlaying || durationRef.current === 0) return;
    
    let interval: ReturnType<typeof setInterval> | null = null;
    
    const start = () => {
      interval = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        const now = Math.floor(Date.now() / 1000);
        const newElapsed = now - playedAtRef.current;
        if (newElapsed <= durationRef.current) {
          setCurrentElapsed(newElapsed);
        }
      }, 1000);
    };
    
    start();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nowPlaying.playedAt]);

  useEffect(() => {
    // Fetch immediately
    fetchNowPlaying();

    // Poll every 30 seconds when playing (was 20s)
    const interval = setInterval(() => {
      if (isPlaying && document.visibilityState === 'visible') {
        fetchNowPlaying();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isPlaying, fetchNowPlaying]);

  return { ...nowPlaying, elapsed: currentElapsed };
};
