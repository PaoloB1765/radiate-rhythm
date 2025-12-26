import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

const VolumeControl = ({ volume, onVolumeChange, onMuteToggle, isMuted }: VolumeControlProps) => {
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <button
        onClick={onMuteToggle}
        className={cn(
          "p-2 rounded-full transition-colors",
          "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50",
          isMuted ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>
      
      <Slider
        value={[isMuted ? 0 : volume * 100]}
        max={100}
        step={1}
        onValueChange={(values) => onVolumeChange(values[0] / 100)}
        className="flex-1"
      />
      
      <span className="text-sm text-muted-foreground w-10 text-right font-medium">
        {Math.round(isMuted ? 0 : volume * 100)}%
      </span>
    </div>
  );
};

export default VolumeControl;
