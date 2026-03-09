import { Cast } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CastButtonProps {
  isAvailable: boolean;
  isCasting: boolean;
  deviceName: string;
  aggressiveUpdate: boolean;
  onAggressiveUpdateChange: (v: boolean) => void;
  onCast: () => void;
  onStop: () => void;
}

const CastButton = ({ isAvailable, isCasting, deviceName, aggressiveUpdate, onAggressiveUpdateChange, onCast, onStop }: CastButtonProps) => {
  if (!isAvailable) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={isCasting ? onStop : onCast}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          isCasting
            ? "bg-primary/20 text-primary glow-red"
            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        aria-label={isCasting ? "Interrompi Cast" : "Trasmetti su dispositivo"}
        title={isCasting ? `Trasmettendo su ${deviceName}` : "Trasmetti"}
      >
        <Cast className={`w-5 h-5 ${isCasting ? "animate-pulse" : ""}`} />
        {isCasting && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
        )}
      </button>
      {isCasting && deviceName && (
        <span className="text-xs text-primary/80 font-medium truncate max-w-[120px]">
          {deviceName}
        </span>
      )}
      {isCasting && (
        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
          <Switch
            checked={aggressiveUpdate}
            onCheckedChange={onAggressiveUpdateChange}
            className="scale-75"
          />
          <span className="text-[10px] text-muted-foreground leading-tight">
            Sync 20s
          </span>
        </label>
      )}
    </div>
  );
};

export default CastButton;
