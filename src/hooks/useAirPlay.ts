import { useState, useEffect, useCallback } from "react";

interface UseAirPlayReturn {
  isAvailable: boolean;
  isActive: boolean;
  showPicker: () => void;
}

export const useAirPlay = (
  audioElement: HTMLAudioElement | null
): UseAirPlayReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!audioElement) return;

    // Check for WebKit AirPlay support (Safari / WebKit browsers)
    const hasAirPlay =
      "webkitShowPlaybackTargetPicker" in audioElement ||
      ("remote" in audioElement && "watchAvailability" in (audioElement as any).remote);

    if (!hasAirPlay) return;

    // Remote Playback API (modern approach)
    if ("remote" in audioElement) {
      const remote = (audioElement as any).remote;

      remote.watchAvailability((available: boolean) => {
        setIsAvailable(available);
      }).catch(() => {
        // watchAvailability not supported, fall back to assuming available
        setIsAvailable(true);
      });

      const handleConnecting = () => setIsActive(false);
      const handleConnect = () => setIsActive(true);
      const handleDisconnect = () => setIsActive(false);

      remote.addEventListener("connecting", handleConnecting);
      remote.addEventListener("connect", handleConnect);
      remote.addEventListener("disconnect", handleDisconnect);

      return () => {
        remote.cancelWatchAvailability().catch(() => {});
        remote.removeEventListener("connecting", handleConnecting);
        remote.removeEventListener("connect", handleConnect);
        remote.removeEventListener("disconnect", handleDisconnect);
      };
    }

    // Legacy WebKit AirPlay (older Safari)
    setIsAvailable(true);

    const el = audioElement as HTMLAudioElement;
    const handleTargetChange = () => {
      const playing = (el as any).webkitCurrentPlaybackTargetIsWireless;
      setIsActive(!!playing);
    };

    el.addEventListener(
      "webkitcurrentplaybacktargetiswirelesschanged" as any,
      handleTargetChange
    );

    return () => {
      el.removeEventListener(
        "webkitcurrentplaybacktargetiswirelesschanged" as any,
        handleTargetChange
      );
    };
  }, [audioElement]);

  const showPicker = useCallback(() => {
    if (!audioElement) return;

    // Remote Playback API
    if ("remote" in audioElement) {
      (audioElement as any).remote.prompt().catch((err: any) => {
        if (err.name !== "NotAllowedError") {
          console.error("AirPlay prompt error:", err);
        }
      });
      return;
    }

    // Legacy WebKit
    if ("webkitShowPlaybackTargetPicker" in audioElement) {
      (audioElement as any).webkitShowPlaybackTargetPicker();
    }
  }, [audioElement]);

  return { isAvailable, isActive, showPicker };
};
