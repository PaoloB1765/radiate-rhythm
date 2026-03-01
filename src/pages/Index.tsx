import vrsLogo from "@/assets/vrs-logo.jpg";
import VinylDisc from "@/components/VinylDisc";
import PlayButton from "@/components/PlayButton";
import VolumeControl from "@/components/VolumeControl";
import NowPlaying from "@/components/NowPlaying";
import VUMeter from "@/components/VUMeter";
import CastButton from "@/components/CastButton";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useChromecast } from "@/hooks/useChromecast";
import { Radio, Facebook, Heart } from "lucide-react";

const Index = () => {
  const { isPlaying, isLoading, volume, isMuted, analyser, togglePlay, setVolume, toggleMute } = useAudioPlayer();
  const nowPlaying = useNowPlaying(isPlaying);
  const { isCasting, isAvailable, deviceName, startCasting, stopCasting } = useChromecast(nowPlaying);

  // Media Session API for lock screen controls and artwork
  useMediaSession({
    title: nowPlaying.title,
    artist: nowPlaying.artist,
    coverArt: nowPlaying.coverArt,
    isPlaying,
    onPlay: togglePlay,
    onPause: togglePlay,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background gradients */}
      <div 
        className="absolute inset-0 -z-10 transition-opacity duration-700"
        style={{ 
          background: 'var(--gradient-hero)',
          opacity: isPlaying ? 1 : 0.6
        }}
      />
      <div 
        className="absolute inset-0 -z-10 transition-opacity duration-700"
        style={{ 
          background: 'var(--gradient-glow)',
          opacity: isPlaying ? 1 : 0.4
        }}
      />
      
      {/* Decorative elements - optimized: reduced blur and removed scale transforms */}
      <div className={`absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary/15 blur-xl transition-opacity duration-700 ${isPlaying ? 'opacity-80' : 'opacity-30'}`} />
      <div className={`absolute bottom-20 right-10 w-48 h-48 rounded-full bg-primary/15 blur-xl transition-opacity duration-700 ${isPlaying ? 'opacity-80' : 'opacity-30'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10 blur-2xl transition-opacity duration-700 ${isPlaying ? 'opacity-70' : 'opacity-0'}`} />

      {/* Main content */}
      <main className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-lg">
        {/* Logo and header */}
        <header className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-full">
            <a
              href="https://www.produzionidalbasso.com/project/viva-radio-star/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-4 md:left-[-50px] flex flex-col items-center gap-1.5 text-muted-foreground/70 hover:text-primary transition-colors group"
            >
              <Heart className="w-8 h-8 animate-pulse group-hover:fill-primary transition-all" />
              <span className="text-sm font-bold">DONATE</span>
            </a>
            <a 
              href="https://www.vivaradiostar.it" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src={vrsLogo} 
                alt="Viva RadioStar Logo" 
                className="w-40 h-40 md:w-52 md:h-52 object-contain hover:scale-105 transition-transform"
              />
            </a>
            <a
              href="https://www.facebook.com/share/1BxxaVKhvM/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-4 md:right-[-40px] text-muted-foreground/70 hover:text-primary transition-colors"
            >
              <Facebook className="w-8 h-8" />
            </a>
          </div>
          <p 
            className={`text-sm flex items-center justify-center gap-2 transition-all duration-500 ${
              isPlaying 
                ? 'animate-neon-shift' 
                : 'text-muted-foreground'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>La radio che ti porta negli anni d'oro della Musica</span>
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Clicca il logo VRS per scoprire di più su Viva RadioStar
          </p>
        </header>

        {/* Vinyl disc visualization */}
        <VinylDisc 
          isPlaying={isPlaying} 
          coverArt={nowPlaying.coverArt}
          duration={nowPlaying.duration}
          elapsed={nowPlaying.elapsed}
        />

        {/* Play button and Cast */}
        <div className="mt-4 flex items-center gap-6">
          <PlayButton 
            isPlaying={isPlaying} 
            isLoading={isLoading} 
            onClick={togglePlay}
          />
          <CastButton
            isAvailable={isAvailable}
            isCasting={isCasting}
            deviceName={deviceName}
            onCast={startCasting}
            onStop={stopCasting}
          />
        </div>

        {/* VU Meter */}
        <VUMeter 
          analyser={analyser}
          isPlaying={isPlaying}
        />

        {/* Now playing info */}
        <NowPlaying 
          artist={nowPlaying.artist}
          title={nowPlaying.title}
          album={nowPlaying.album}
          isPlaying={isPlaying}
          nextArtist={nowPlaying.nextArtist}
          nextTitle={nowPlaying.nextTitle}
          nextCoverArt={nowPlaying.nextCoverArt}
          songHistory={nowPlaying.songHistory}
        />

        {/* Volume control */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <VolumeControl
            volume={volume}
            onVolumeChange={setVolume}
            onMuteToggle={toggleMute}
            isMuted={isMuted}
          />
          <div className="text-xs text-muted-foreground/70 text-center space-y-1">
            <p>Nr. Licenza S.I.A.E. : 202600000005</p>
            <p>Nr. Licenza SCF : 3/5/26</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center">
        <p className="text-xs text-muted-foreground/50">
          Streaming live • Powered by VRS
        </p>
      </footer>
    </div>
  );
};

export default Index;
