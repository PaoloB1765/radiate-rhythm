import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NowPlayingProps {
  artist: string;
  title: string;
  isPlaying: boolean;
  nextArtist?: string;
  nextTitle?: string;
}

const NowPlaying = ({ artist, title, isPlaying, nextArtist, nextTitle }: NowPlayingProps) => {
  return (
    <div className="glass-card p-4 md:p-6 w-full max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isPlaying ? "bg-accent animate-pulse" : "bg-muted-foreground"
        )} />
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          {isPlaying ? "Now Playing" : "Paused"}
        </span>
      </div>
      
      {title ? (
        <div className="space-y-1">
          <h2 className="font-['Arial'] text-xl md:text-2xl text-foreground truncate">
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg truncate">
            {artist || "Unknown Artist"}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Music2 className="w-5 h-5" />
          <span className="text-base">Waiting for stream info...</span>
        </div>
      )}
      
      {/* Next Song */}
      {nextTitle && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <span className="text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold">
            Next Song:
          </span>
          <p className="text-sm text-foreground/80 truncate mt-1">
            {nextTitle} {nextArtist && <span className="text-muted-foreground">- {nextArtist}</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;
