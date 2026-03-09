import { Airplay } from "lucide-react";

interface AirPlayButtonProps {
  isAvailable: boolean;
  isActive: boolean;
  onPress: () => void;
}

const AirPlayButton = ({ isAvailable, isActive, onPress }: AirPlayButtonProps) => {
  if (!isAvailable) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onPress}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-primary/20 text-primary glow-red"
            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        aria-label={isActive ? "AirPlay attivo" : "Trasmetti con AirPlay"}
        title={isActive ? "AirPlay attivo" : "AirPlay"}
      >
        <Airplay className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
        )}
      </button>
      {isActive && (
        <span className="text-xs text-primary/80 font-medium">AirPlay</span>
      )}
    </div>
  );
};

export default AirPlayButton;
