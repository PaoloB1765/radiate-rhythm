import { useState, useCallback, useEffect } from "react";

interface CastingState {
  isCasting: boolean;
  castType: 'chromecast' | 'airplay' | null;
  deviceName: string | null;
  isAvailable: boolean;
}

export const useCasting = (streamUrl: string) => {
  const [castingState, setCastingState] = useState<CastingState>({
    isCasting: false,
    castType: null,
    deviceName: null,
    isAvailable: false,
  });

  // Check if Chromecast is available (Chrome browser with Cast extension)
  const checkChromecastAvailability = useCallback(() => {
    // Chrome Cast API check
    const isChromecastAvailable = 
      typeof window !== 'undefined' && 
      'chrome' in window && 
      typeof (window as any).chrome?.cast !== 'undefined';
    
    return isChromecastAvailable;
  }, []);

  // Check if AirPlay is available (Safari on macOS/iOS)
  const checkAirPlayAvailability = useCallback(() => {
    const audio = document.createElement('audio');
    // AirPlay is available in Safari
    const isAirPlayAvailable = 
      typeof (audio as any).webkitShowPlaybackTargetPicker === 'function' ||
      (typeof window !== 'undefined' && 'WebKitPlaybackTargetAvailabilityEvent' in window);
    
    return isAirPlayAvailable;
  }, []);

  useEffect(() => {
    const hasChromecast = checkChromecastAvailability();
    const hasAirPlay = checkAirPlayAvailability();
    
    setCastingState(prev => ({
      ...prev,
      isAvailable: hasChromecast || hasAirPlay,
    }));
  }, [checkChromecastAvailability, checkAirPlayAvailability]);

  // Start AirPlay casting
  const startAirPlay = useCallback((audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      console.error("No audio element provided for AirPlay");
      return;
    }

    // Safari's AirPlay picker
    if (typeof (audioElement as any).webkitShowPlaybackTargetPicker === 'function') {
      (audioElement as any).webkitShowPlaybackTargetPicker();
    } else {
      console.log("AirPlay non disponibile in questo browser");
    }
  }, []);

  // For Chromecast, users need to use the browser's native cast button
  // or we can provide a URL to open in a cast-enabled app
  const getCastUrl = useCallback(() => {
    return streamUrl;
  }, [streamUrl]);

  // Share stream URL for external casting apps
  const shareForCasting = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Viva Radio Star - Streaming',
          text: 'Ascolta Viva Radio Star in streaming',
          url: streamUrl,
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(streamUrl);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  }, [streamUrl]);

  return {
    castingState,
    startAirPlay,
    getCastUrl,
    shareForCasting,
    isAirPlayAvailable: checkAirPlayAvailability(),
    isChromecastAvailable: checkChromecastAvailability(),
  };
};
