import vrsLogo from "@/assets/vrs-logo.jpg";
import VinylDisc from "@/components/VinylDisc";
import PlayButton from "@/components/PlayButton";
import VolumeControl from "@/components/VolumeControl";
import NowPlaying from "@/components/NowPlaying";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { Radio } from "lucide-react";

const Index = () => {
  const { isPlaying, isLoading, volume, isMuted, togglePlay, setVolume, toggleMute } = useAudioPlayer();
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
          <img 
            src={vrsLogo} 
            alt="Viva RadioStar Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain animate-float"
          />
          <div className="text-center">
            <h1 className="font-['Arial'] text-2xl md:text-3xl text-foreground tracking-wide">
              VIVA RADIOSTAR
            </h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 mt-1">
              <Radio className="w-4 h-4" />
              <span>La radio che ti porta negli anni d'oro della Musica</span>
            </p>
          </div>
        </header>

        {/* Vinyl disc visualization */}
        <VinylDisc 
          isPlaying={isPlaying} 
          coverArt={nowPlaying.coverArt}
          duration={nowPlaying.duration}
          elapsed={nowPlaying.elapsed}
        />

        {/* Play button */}
        <PlayButton 
          isPlaying={isPlaying} 
          isLoading={isLoading} 
          onClick={togglePlay}
        />

        {/* Now playing info */}
        <NowPlaying 
          artist={nowPlaying.artist}
          title={nowPlaying.title}
          isPlaying={isPlaying}
        />

        {/* Volume control */}
        <VolumeControl
          volume={volume}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
          isMuted={isMuted}
        />
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
