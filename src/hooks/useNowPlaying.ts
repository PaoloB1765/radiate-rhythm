import { useState, useEffect, useCallback, useRef } from "react";

interface NowPlayingData {
  artist: string;
  title: string;
  coverArt: string;
  duration: number;
  elapsed: number;
  playedAt: number;
  nextArtist: string;
  nextCoverArt: string;
  nextTitle: string;
}

const NOW_PLAYING_URL = "https://vrs-blackbox.ddns.net/api/nowplaying/vrs";

export const useNowPlaying = (isPlaying: boolean) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>({
    artist: "",
    title: "",
    coverArt: "",
    duration: 0,
    elapsed: 0,
    playedAt: 0,
    nextArtist: "",
    nextTitle: "",
    nextCoverArt: "",
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
      
      if (nowPlayingTrack) {
        setNowPlaying({
          artist: nowPlayingTrack.artist || "",
          title: nowPlayingTrack.title || "",
          coverArt: nowPlayingTrack.art || data.now_playing?.song?.art || "",
          duration,
          elapsed,
          playedAt,
          nextArtist: nextSong?.artist || "",
          nextTitle: nextSong?.title || "",
          nextCoverArt: nextSong?.art || "",
        });
        setCurrentElapsed(elapsed);
      }
    } catch (error) {
      console.error("Error fetching now playing:", error);
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!isPlaying || durationRef.current === 0) return;
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const newElapsed = now - playedAtRef.current;
      if (newElapsed <= durationRef.current) {
        setCurrentElapsed(newElapsed);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, nowPlaying.playedAt]);

  useEffect(() => {
    // Fetch immediately
    fetchNowPlaying();

    // Poll every 20 seconds when playing
    const interval = setInterval(() => {
      if (isPlaying) {
        fetchNowPlaying();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isPlaying, fetchNowPlaying]);

  return { ...nowPlaying, elapsed: currentElapsed };
};
