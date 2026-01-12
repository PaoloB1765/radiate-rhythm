import { useState } from "react";
import { Music, ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";
import { useSongRequests } from "@/hooks/useSongRequests";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SongRequest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    songs,
    isLoading,
    isRequesting,
    error,
    successMessage,
    fetchRequestableSongs,
    searchSongs,
    requestSong,
    clearMessages,
  } = useSongRequests();

  const handleToggle = () => {
    if (!isOpen) {
      fetchRequestableSongs();
      clearMessages();
    }
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchSongs(value);
  };

  const handleRequest = async (requestId: string) => {
    await requestSong(requestId);
  };

  return (
    <div className="w-full max-w-md mt-4">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30"
      >
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Richiedi un Brano</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0"
        )}
      >
        <div className="glass-card p-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca per titolo, artista o album..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>

          {/* Messages */}
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          {successMessage && (
            <p className="text-xs text-accent text-center">{successMessage}</p>
          )}

          {/* Songs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : songs.length > 0 ? (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-3">
                {songs.map((song) => (
                  <div
                    key={song.request_id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    {song.song.art && (
                      <img
                        src={song.song.art}
                        alt={song.song.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{song.song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.song.artist}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRequest(song.request_id)}
                      disabled={isRequesting}
                      className="flex-shrink-0 text-xs px-2 py-1 h-auto bg-primary/20 hover:bg-primary/40 text-primary"
                    >
                      {isRequesting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Richiedi"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? "Nessun brano trovato" : "Nessun brano disponibile"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongRequest;
