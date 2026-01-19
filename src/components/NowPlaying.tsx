import { Music2, ChevronDown, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SongHistoryItem {
  artist: string;
  title: string;
  coverArt: string;
  playedAt: number;
}

interface NowPlayingProps {
  artist: string;
  title: string;
  album?: string;
  isPlaying: boolean;
  nextArtist?: string;
  nextTitle?: string;
  nextCoverArt?: string;
  songHistory?: SongHistoryItem[];
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

const NowPlaying = ({ artist, title, album, isPlaying, nextArtist, nextTitle, nextCoverArt, songHistory = [] }: NowPlayingProps) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
          <h2 className={cn(
            "font-['Arial'] text-foreground w-full",
            title.length > 28 
              ? "text-base md:text-lg leading-tight" 
              : "text-xl md:text-2xl"
          )}>
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg truncate">
            {artist || "Unknown Artist"}
          </p>
          {album && (
            <p className="text-muted-foreground/70 text-sm truncate">
              <span>Album: </span><span className="italic">{album}</span>
            </p>
          )}
          <a 
            href="https://ai.studio/apps/drive/1s2fKJJcl4RBrnrUcr-VPEO8-xacGPK3J" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-accent hover:text-accent/80 transition-colors uppercase tracking-wider font-semibold"
          >
            <ExternalLink className="w-3 h-3" />
            More Info
          </a>
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
          <div className="flex items-center gap-3 mt-2">
            {nextCoverArt && (
              <img 
                src={nextCoverArt} 
                alt="Next song cover" 
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm text-foreground/80 truncate">{nextTitle}</p>
              {nextArtist && <p className="text-xs text-muted-foreground truncate">{nextArtist}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Song History */}
      {songHistory.length > 0 && (
        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="mt-4 pt-3 border-t border-border/30">
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Song History
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground/70 transition-transform duration-200",
              isHistoryOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ScrollArea className="h-48 pr-2">
              <div className="space-y-2">
                {songHistory.map((song, index) => (
                  <div key={`${song.playedAt}-${index}`} className="flex items-center gap-3 py-1.5">
                    {song.coverArt && (
                      <img 
                        src={song.coverArt} 
                        alt="Song cover" 
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground/70 truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground/60 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-muted-foreground/50 flex-shrink-0">
                      {formatTime(song.playedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default NowPlaying;
