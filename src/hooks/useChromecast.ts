import { useState, useEffect, useCallback, useRef } from "react";

const STREAM_URL = "https://vrs-blackbox.ddns.net/listen/vrs/radio.mp3";
const VRS_LOGO = "https://vivaradiostar.lovable.app/cast-logo.jpg";

interface UseChromecastReturn {
  isCasting: boolean;
  isAvailable: boolean;
  deviceName: string;
  startCasting: () => void;
  stopCasting: () => void;
}

const getCast = (): any => (window as any).cast;
const getChrome = (): any => (window as any).chrome;

export const useChromecast = (
  _nowPlaying: { artist: string; title: string; coverArt: string }
): UseChromecastReturn => {
  const [isCasting, setIsCasting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    // Detect WebView environments (Capacitor, Median) where Cast SDK won't work
    const ua = navigator.userAgent || "";
    const isWebView =
      /wv|WebView/i.test(ua) ||
      /; wv\)/.test(ua) ||
      !!(window as any).Capacitor ||
      !!(window as any).median ||
      !!(window as any).gonative;
    if (isWebView) return;

    const initCast = () => {
      const castFw = getCast()?.framework;
      const chromeCast = getChrome()?.cast;
      if (!castFw || !chromeCast) return;

      const castContext = castFw.CastContext.getInstance();

      castContext.setOptions({
        receiverApplicationId: chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      setIsAvailable(true);

      castContext.addEventListener(
        castFw.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          const session = castContext.getCurrentSession();

          if (
            event.sessionState === castFw.SessionState.SESSION_STARTED ||
            event.sessionState === castFw.SessionState.SESSION_RESUMED
          ) {
            sessionRef.current = session;
            setIsCasting(true);
            setDeviceName(session?.getCastDevice().friendlyName || "");
            loadMedia(session);
          } else if (event.sessionState === castFw.SessionState.SESSION_ENDED) {
            sessionRef.current = null;
            setIsCasting(false);
            setDeviceName("");
          }
        }
      );
    };

    // Check if Cast API is already loaded
    if (getCast()?.framework) {
      initCast();
    } else {
      (window as any).__onGCastApiAvailable = (avail: boolean) => {
        if (avail) initCast();
      };
    }
  }, []);

  const loadMedia = useCallback((session: any) => {
    if (!session) return;
    const chromeCast = getChrome()?.cast;
    if (!chromeCast) return;

    const mediaInfo = new chromeCast.media.MediaInfo(STREAM_URL, "audio/mpeg");
    mediaInfo.streamType = chromeCast.media.StreamType.LIVE;

    // Metadati statici: visualizziamo sempre e solo branding radio
    const metadata = new chromeCast.media.MusicTrackMediaMetadata();
    metadata.title = "Viva RadioStar";
    metadata.artist = "Live Stream";
    metadata.albumName = "Viva RadioStar";
    metadata.images = [new chromeCast.Image(VRS_LOGO)];

    mediaInfo.metadata = metadata;

    const request = new chromeCast.media.LoadRequest(mediaInfo);
    request.autoplay = true;

    session.loadMedia(request).then(
      () => console.log("Cast: Media loaded successfully"),
      (error: any) => console.error("Cast: Load media error", error)
    );
  }, []);

  const startCasting = useCallback(() => {
    const castFw = getCast()?.framework;
    if (!castFw) return;
    castFw.CastContext.getInstance().requestSession().catch((error: any) => {
      if (error !== "cancel") {
        console.error("Cast: Session request error", error);
      }
    });
  }, []);

  const stopCasting = useCallback(() => {
    const castFw = getCast()?.framework;
    if (!castFw) return;
    castFw.CastContext.getInstance().endCurrentSession(true);
    setIsCasting(false);
    setDeviceName("");
  }, []);

  return {
    isCasting,
    isAvailable,
    deviceName,
    startCasting,
    stopCasting,
  };
};
