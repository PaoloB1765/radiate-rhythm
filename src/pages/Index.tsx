import vrsLogo from "@/assets/vrs-logo.jpg";
import VinylDisc from "@/components/VinylDisc";
import PlayButton from "@/components/PlayButton";
import VolumeControl from "@/components/VolumeControl";
import NowPlaying from "@/components/NowPlaying";
import VUMeter from "@/components/VUMeter";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useMediaSession } from "@/hooks/useMediaSession";
import { Radio, Facebook, Heart } from "lucide-react";

const Index = () => {
  const { isPlaying, isLoading, volume, isMuted, analyser, togglePlay, setVolume, toggleMute } = useAudioPlayer();
  const nowPlaying = useNowPlaying(isPlaying);

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
      
      {/* Decorative elements */}
      <div className={`absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl transition-all duration-700 ${isPlaying ? 'opacity-100 scale-150' : 'opacity-50 scale-100'}`} />
      <div className={`absolute bottom-20 right-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl transition-all duration-700 ${isPlaying ? 'opacity-100 scale-150' : 'opacity-40 scale-100'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/15 blur-[100px] transition-all duration-700 ${isPlaying ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />

      {/* Main content */}
      <main className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-lg">
        {/* Logo and header */}
        <header className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-full">
            <a
              href="https://www.produzionidalbasso.com/project/viva-radio-star/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-4 md:left-[-40px] flex flex-col items-center gap-1 text-muted-foreground/70 hover:text-primary transition-colors group"
            >
              <Heart className="w-6 h-6 group-hover:fill-primary transition-all" />
              <span className="text-xs font-semibold">DONATE</span>
            </a>
            <a 
              href="https://www.vivaradiostar.it" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src={vrsLogo} 
                alt="Viva RadioStar Logo" 
                className={`w-40 h-40 md:w-52 md:h-52 object-contain hover:scale-105 transition-transform ${isPlaying ? 'animate-float' : ''}`}
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
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
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

        {/* Play button */}
        <div className="mt-4">
          <PlayButton 
            isPlaying={isPlaying} 
            isLoading={isLoading} 
            onClick={togglePlay}
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
