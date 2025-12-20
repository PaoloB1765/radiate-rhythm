import { Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onClick: () => void;
}

const PlayButton = ({ isPlaying, isLoading, onClick }: PlayButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative w-20 h-20 md:w-24 md:h-24 rounded-full",
        "bg-gradient-to-br from-primary to-primary/80",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-primary/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isPlaying ? "glow-red" : "shadow-xl"
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary-foreground/20 to-transparent" />
      
      {isLoading ? (
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground relative z-10" />
      ) : (
        <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground relative z-10 ml-1" />
      )}
    </button>
  );
};

export default PlayButton;
