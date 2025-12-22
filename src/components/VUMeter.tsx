import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VUMeterProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const LED_COUNT = 16;
const DECAY_RATE = 0.92;

const VUMeter = ({ analyser, isPlaying }: VUMeterProps) => {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const animationRef = useRef<number>();
  const peakHold = useRef(0);
  const peakDecay = useRef(0);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      setLevel(0);
      setPeak(0);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }

      const avg = sum / bufferLength / 255;
      const scaled = Math.min(1, avg * 2.5);

      setLevel(scaled);

      // Peak hold logic
      if (scaled > peakDecay.current) {
        peakDecay.current = scaled;
        peakHold.current = 30;
      } else if (peakHold.current > 0) {
        peakHold.current--;
      } else {
        peakDecay.current *= DECAY_RATE;
      }

      setPeak(peakDecay.current);

      animationRef.current = requestAnimationFrame(updateLevels);
    };

    animationRef.current = requestAnimationFrame(updateLevels);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  const getLEDColor = (index: number, isActive: boolean, isPeak: boolean) => {
    if (!isActive && !isPeak) return "bg-muted/30";
    
    const threshold1 = Math.floor(LED_COUNT * 0.6);
    const threshold2 = Math.floor(LED_COUNT * 0.85);
    
    if (index < threshold1) {
      return isPeak ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-green-500";
    } else if (index < threshold2) {
      return isPeak ? "bg-yellow-400 shadow-yellow-400/50 shadow-sm" : "bg-yellow-500";
    } else {
      return isPeak ? "bg-red-400 shadow-red-400/50 shadow-sm" : "bg-red-500";
    }
  };

  const activeLEDs = Math.floor(level * LED_COUNT);
  const peakLED = Math.floor(peak * LED_COUNT);

  return (
    <div className="glass-card p-4 w-full max-w-md">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-6">
          -∞
        </span>
        <div className="flex gap-[3px] flex-1">
          {Array.from({ length: LED_COUNT }).map((_, index) => {
            const isActive = index < activeLEDs;
            const isPeak = index === peakLED && peak > 0.05;
            
            return (
              <div
                key={index}
                className={cn(
                  "flex-1 h-4 rounded-sm transition-all duration-75",
                  getLEDColor(index, isActive, isPeak)
                )}
              />
            );
          })}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-6 text-right">
          +12
        </span>
      </div>
    </div>
  );
};

export default VUMeter;
