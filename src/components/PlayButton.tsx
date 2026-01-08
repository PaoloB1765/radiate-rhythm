import { Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onClick: () => void;
  size?: "small" | "default";
}

const PlayButton = ({ isPlaying, isLoading, onClick, size = "default" }: PlayButtonProps) => {
  const isSmall = size === "small";
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative rounded-full",
        isSmall ? "w-12 h-12 md:w-14 md:h-14" : "w-16 h-16 md:w-20 md:h-20",
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
        <Loader2 className={cn(
          "text-primary-foreground animate-spin",
          isSmall ? "w-5 h-5 md:w-6 md:h-6" : "w-6 h-6 md:w-8 md:h-8"
        )} />
      ) : isPlaying ? (
        <Pause className={cn(
          "text-primary-foreground relative z-10",
          isSmall ? "w-5 h-5 md:w-6 md:h-6" : "w-6 h-6 md:w-8 md:h-8"
        )} />
      ) : (
        <Play className={cn(
          "text-primary-foreground relative z-10 ml-0.5",
          isSmall ? "w-5 h-5 md:w-6 md:h-6" : "w-6 h-6 md:w-8 md:h-8"
        )} />
      )}
    </button>
  );
};

export default PlayButton;
