import { useState, useEffect, useCallback } from "react";

interface NowPlayingData {
  artist: string;
  title: string;
  coverArt: string;
}

const NOW_PLAYING_URL = "https://vrs-blackbox.ddns.net/api/nowplaying/vrs";

export const useNowPlaying = (isPlaying: boolean) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>({
    artist: "",
    title: "",
    coverArt: "",
  });

  const fetchNowPlaying = useCallback(async () => {
    try {
      const response = await fetch(NOW_PLAYING_URL);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      // AzuraCast API structure
      const nowPlayingTrack = data.now_playing?.song;
      
      if (nowPlayingTrack) {
        setNowPlaying({
          artist: nowPlayingTrack.artist || "",
          title: nowPlayingTrack.title || "",
          coverArt: nowPlayingTrack.art || data.now_playing?.song?.art || "",
        });
      }
    } catch (error) {
      console.error("Error fetching now playing:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately
    fetchNowPlaying();

    // Poll every 10 seconds when playing
    const interval = setInterval(() => {
      if (isPlaying) {
        fetchNowPlaying();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, fetchNowPlaying]);

  return nowPlaying;
};
