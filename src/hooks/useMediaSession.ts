import { useEffect, useCallback } from "react";

interface MediaSessionOptions {
  title: string;
  artist: string;
  album?: string;
  coverArt: string;
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const useMediaSession = ({
  title,
  artist,
  album = "Viva RadioStar",
  coverArt,
  isPlaying,
  onPlay,
  onPause,
}: MediaSessionOptions) => {
  
  const updateMetadata = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    const artwork: MediaImage[] = [];
    
    if (coverArt) {
      // Add cover art in multiple sizes for different devices
      artwork.push(
        { src: coverArt, sizes: "96x96", type: "image/jpeg" },
        { src: coverArt, sizes: "128x128", type: "image/jpeg" },
        { src: coverArt, sizes: "192x192", type: "image/jpeg" },
        { src: coverArt, sizes: "256x256", type: "image/jpeg" },
        { src: coverArt, sizes: "384x384", type: "image/jpeg" },
        { src: coverArt, sizes: "512x512", type: "image/jpeg" }
      );
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || "Viva RadioStar",
      artist: artist || "In onda",
      album,
      artwork,
    });
  }, [title, artist, album, coverArt]);

  // Update playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Update metadata when song changes
  useEffect(() => {
    updateMetadata();
  }, [updateMetadata]);

  // Set up action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const actionHandlers: { action: MediaSessionAction; handler: () => void }[] = [
      { action: "play", handler: () => onPlay?.() },
      { action: "pause", handler: () => onPause?.() },
    ];

    actionHandlers.forEach(({ action, handler }) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`Media session action '${action}' not supported`);
      }
    });

    return () => {
      actionHandlers.forEach(({ action }) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, [onPlay, onPause]);
};
