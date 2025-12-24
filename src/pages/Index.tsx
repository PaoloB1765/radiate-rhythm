import vrsLogo from "@/assets/vrs-logo.jpg";
import VinylDisc from "@/components/VinylDisc";
import PlayButton from "@/components/PlayButton";
import VolumeControl from "@/components/VolumeControl";
import NowPlaying from "@/components/NowPlaying";
import VUMeter from "@/components/VUMeter";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { Radio } from "lucide-react";

const Index = () => {
  const { isPlaying, isLoading, volume, isMuted, analyser, togglePlay, setVolume, toggleMute } = useAudioPlayer();
  const nowPlaying = useNowPlaying(isPlaying);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background gradients */}
      <div 
        className="absolute inset-0 -z-10"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div 
        className="absolute inset-0 -z-10"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

      {/* Main content */}
      <main className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-lg">
        {/* Logo and header */}
        <header className="flex flex-col items-center gap-4">
          <a 
            href="https://www.vivaradiostar.it" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={vrsLogo} 
              alt="Viva RadioStar Logo" 
              className="w-32 h-32 md:w-44 md:h-44 object-contain animate-float hover:scale-105 transition-transform"
            />
          </a>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Radio className="w-4 h-4" />
            <span>La radio che ti porta negli anni d'oro della Musica</span>
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
          isPlaying={isPlaying}
          nextArtist={nowPlaying.nextArtist}
          nextTitle={nowPlaying.nextTitle}
          nextCoverArt={nowPlaying.nextCoverArt}
        />

        {/* Volume control */}
        <div className="mb-6">
          <VolumeControl
            volume={volume}
            onVolumeChange={setVolume}
            onMuteToggle={toggleMute}
            isMuted={isMuted}
          />
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
