import vrsLogo from "@/assets/vrs-logo.jpg";
import PlayButton from "@/components/PlayButton";
import VolumeControl from "@/components/VolumeControl";
import NowPlaying from "@/components/NowPlaying";
import VUMeter from "@/components/VUMeter";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useMediaSession } from "@/hooks/useMediaSession";
import { Radio, Facebook, Music } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
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
      <div className={`absolute top-10 left-10 w-32 h-32 rounded-full bg-secondary/20 blur-3xl transition-all duration-700 ${isPlaying ? 'opacity-100 scale-150' : 'opacity-50 scale-100'}`} />
      <div className={`absolute bottom-20 right-10 w-36 h-36 rounded-full bg-primary/20 blur-3xl transition-all duration-700 ${isPlaying ? 'opacity-100 scale-150' : 'opacity-40 scale-100'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/15 blur-[100px] transition-all duration-700 ${isPlaying ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />

      {/* Main content - Horizontal layout */}
      <main className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 w-full max-w-6xl min-h-[60vh] md:min-h-0">
        
        {/* Left section: Logo */}
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 md:min-w-[140px]">
          <a 
            href="https://www.vivaradiostar.it" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={vrsLogo} 
              alt="Viva RadioStar Logo" 
              className={`w-28 h-28 md:w-36 md:h-36 object-contain hover:scale-105 transition-transform ${isPlaying ? 'animate-float' : ''}`}
            />
          </a>
          <a
            href="https://www.facebook.com/share/1BxxaVKhvM/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-primary transition-colors"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <div className="text-muted-foreground text-xs flex flex-col items-center gap-1 text-center max-w-[140px]">
            <Radio className="w-3.5 h-3.5" />
            <span>La radio che ti porta</span>
            <span>negli anni d'oro della Musica</span>
          </div>
        </div>

        {/* Center section: Cover Art */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden shadow-xl">
            {nowPlaying.coverArt ? (
              <img 
                src={nowPlaying.coverArt} 
                alt="Cover Art" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Music className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <PlayButton 
            isPlaying={isPlaying} 
            isLoading={isLoading} 
            onClick={togglePlay}
            size="small"
          />
          <VUMeter 
            analyser={analyser}
            isPlaying={isPlaying}
          />
        </div>

        {/* Right section: Now playing + Controls */}
        <div className="flex flex-col items-center justify-center gap-5 md:gap-6 md:min-w-[200px]">
          <NowPlaying 
            artist={nowPlaying.artist}
            title={nowPlaying.title}
            album={nowPlaying.album}
            isPlaying={isPlaying}
            nextArtist={nowPlaying.nextArtist}
            nextTitle={nowPlaying.nextTitle}
            nextCoverArt={nowPlaying.nextCoverArt}
          />
          <VolumeControl
            volume={volume}
            onVolumeChange={setVolume}
            onMuteToggle={toggleMute}
            isMuted={isMuted}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-2 text-center">
        <p className="text-xs text-muted-foreground/50">
          Streaming live • Powered by VRS
        </p>
      </footer>
    </div>
  );
};

export default Index;
