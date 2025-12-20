import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NowPlayingProps {
  artist: string;
  title: string;
  isPlaying: boolean;
}

const NowPlaying = ({ artist, title, isPlaying }: NowPlayingProps) => {
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
          <h2 className="font-display text-xl md:text-2xl text-foreground truncate">
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
    </div>
  );
};

export default NowPlaying;
