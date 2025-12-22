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
          <img 
            src={vrsLogo} 
            alt="Viva RadioStar Logo" 
            className="w-32 h-32 md:w-44 md:h-44 object-contain animate-float"
          />
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

        {/* Now playing info */}
        <NowPlaying 
          artist={nowPlaying.artist}
          title={nowPlaying.title}
          isPlaying={isPlaying}
        />

        {/* VU Meters */}
        <VUMeter 
          analyser={analyser}
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
      <footer className="absolute bottom-4 text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <a 
            href="https://www.facebook.com/profile.php?id=100063635933006&locale=it_IT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a 
            href="https://www.vivaradiostar.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-primary transition-colors"
            aria-label="Sito web"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </a>
        </div>
        <p className="text-xs text-muted-foreground/50">
          Streaming live • Powered by VRS
        </p>
      </footer>
    </div>
  );
};

export default Index;
