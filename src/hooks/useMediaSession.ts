import { useEffect, useCallback, useRef } from "react";

interface MediaSessionOptions {
  title: string;
  artist: string;
  album?: string;
  coverArt: string;
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

/**
 * Pre-fetches an image and converts it to a blob URL.
 * This is necessary for WebView-based apps (Median, Capacitor)
 * where Media Session API can't load external image URLs
 * (e.g. CarPlay, Android Auto, lock screen).
 */
const fetchImageAsBlob = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    // Fallback: try via canvas for CORS-restricted images
    try {
      return await new Promise<string | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              resolve(null);
            }
          }, "image/jpeg", 0.9);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch {
      console.warn("Could not convert cover art to blob URL");
      return null;
    }
  }
};

export const useMediaSession = ({
  title,
  artist,
  album = "Viva RadioStar",
  coverArt,
  isPlaying,
  onPlay,
  onPause,
}: MediaSessionOptions) => {
  const blobUrlRef = useRef<string | null>(null);
  const lastCoverArtRef = useRef<string>("");

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const updateMetadata = useCallback(async () => {
    if (!("mediaSession" in navigator)) return;

    const artwork: MediaImage[] = [];

    if (coverArt) {
      // Convert to blob URL if the cover art changed
      if (coverArt !== lastCoverArtRef.current) {
        // Revoke previous blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        lastCoverArtRef.current = coverArt;
        const blobUrl = await fetchImageAsBlob(coverArt);
        blobUrlRef.current = blobUrl;
      }

      const artUrl = blobUrlRef.current || coverArt;
      const artType = blobUrlRef.current ? "image/jpeg" : "image/jpeg";

      artwork.push(
        { src: artUrl, sizes: "96x96", type: artType },
        { src: artUrl, sizes: "128x128", type: artType },
        { src: artUrl, sizes: "192x192", type: artType },
        { src: artUrl, sizes: "256x256", type: artType },
        { src: artUrl, sizes: "384x384", type: artType },
        { src: artUrl, sizes: "512x512", type: artType }
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
