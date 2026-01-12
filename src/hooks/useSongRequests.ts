import { useState, useCallback } from "react";

interface RequestableSong {
  request_id: string;
  song: {
    id: string;
    title: string;
    artist: string;
    album: string;
    art: string;
  };
}

const STATION_BASE_URL = "https://vrs-blackbox.ddns.net/api/station/vrs";

export const useSongRequests = () => {
  const [songs, setSongs] = useState<RequestableSong[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<RequestableSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequestableSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${STATION_BASE_URL}/requests`);
      if (!response.ok) {
        throw new Error("Impossibile caricare i brani richiedibili");
      }
      
      const data = await response.json();
      setSongs(data);
      setFilteredSongs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchSongs = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredSongs(songs);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = songs.filter(
      (song) =>
        song.song.title.toLowerCase().includes(lowerQuery) ||
        song.song.artist.toLowerCase().includes(lowerQuery) ||
        song.song.album.toLowerCase().includes(lowerQuery)
    );
    setFilteredSongs(filtered);
  }, [songs]);

  const requestSong = useCallback(async (requestId: string) => {
    setIsRequesting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`${STATION_BASE_URL}/request/${requestId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Impossibile inviare la richiesta");
      }
      
      setSuccessMessage("Richiesta inviata con successo!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante la richiesta");
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    songs: filteredSongs,
    isLoading,
    isRequesting,
    error,
    successMessage,
    fetchRequestableSongs,
    searchSongs,
    requestSong,
    clearMessages,
  };
};
