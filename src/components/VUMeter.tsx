import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VUMeterProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const LED_COUNT = 20;
const DECAY_RATE = 0.88;
const TARGET_FPS = 20; // Ridotto da 60fps a 20fps per risparmio batteria
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const VUMeter = ({ analyser, isPlaying }: VUMeterProps) => {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const animationRef = useRef<number>();
  const peakHold = useRef(0);
  const peakDecay = useRef(0);
  const lastFrameTime = useRef(0);
  const isVisible = useRef(true);

  // Pause animation when page is hidden (battery optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      setLevel(0);
      setPeak(0);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = (timestamp: number) => {
      // Skip frames when page is not visible (battery optimization)
      if (!isVisible.current) {
        animationRef.current = requestAnimationFrame(updateLevels);
        return;
      }

      // Throttle to target FPS (battery optimization)
      const elapsed = timestamp - lastFrameTime.current;
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(updateLevels);
        return;
      }
      lastFrameTime.current = timestamp;

      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }

      const avg = sum / bufferLength / 255;
      // Lower scaling: 75% volume should stay in yellow zone
      const scaled = Math.min(1, avg * 1.8);

      setLevel(scaled);

      // Peak hold logic
      if (scaled > peakDecay.current) {
        peakDecay.current = scaled;
        peakHold.current = 15; // Ridotto da 30 per compensare FPS più basso
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
    
    // Adjusted thresholds for more balanced distribution: 50% green, 30% yellow, 20% red
    const threshold1 = Math.floor(LED_COUNT * 0.5);
    const threshold2 = Math.floor(LED_COUNT * 0.8);
    
    if (index < threshold1) {
      return isPeak ? "bg-green-400 shadow-green-400/50 shadow-md" : "bg-green-500";
    } else if (index < threshold2) {
      return isPeak ? "bg-yellow-400 shadow-yellow-400/50 shadow-md" : "bg-yellow-500";
    } else {
      return isPeak ? "bg-red-400 shadow-red-400/50 shadow-md" : "bg-red-500";
    }
  };

  const activeLEDs = Math.floor(level * LED_COUNT);
  const peakLED = Math.floor(peak * LED_COUNT);

  return (
    <div className="glass-card p-4 w-full max-w-md">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-8">
          -16
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
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-8 text-right">
          +6
        </span>
      </div>
    </div>
  );
};

export default VUMeter;
