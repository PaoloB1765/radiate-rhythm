import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VUMeterProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const LED_COUNT = 12;
const DECAY_RATE = 0.92;

const VUMeter = ({ analyser, isPlaying }: VUMeterProps) => {
  const [leftLevel, setLeftLevel] = useState(0);
  const [rightLevel, setRightLevel] = useState(0);
  const [peakLeft, setPeakLeft] = useState(0);
  const [peakRight, setPeakRight] = useState(0);
  const animationRef = useRef<number>();
  const peakHoldLeft = useRef(0);
  const peakHoldRight = useRef(0);
  const peakDecayLeft = useRef(0);
  const peakDecayRight = useRef(0);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      setLeftLevel(0);
      setRightLevel(0);
      setPeakLeft(0);
      setPeakRight(0);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      // Simulate stereo by splitting frequency data
      const mid = Math.floor(bufferLength / 2);
      
      let leftSum = 0;
      let rightSum = 0;
      
      for (let i = 0; i < mid; i++) {
        leftSum += dataArray[i];
      }
      for (let i = mid; i < bufferLength; i++) {
        rightSum += dataArray[i];
      }

      const leftAvg = leftSum / mid / 255;
      const rightAvg = rightSum / (bufferLength - mid) / 255;

      // Apply some smoothing and scaling
      const scaledLeft = Math.min(1, leftAvg * 2.5);
      const scaledRight = Math.min(1, rightAvg * 2.5);

      setLeftLevel(scaledLeft);
      setRightLevel(scaledRight);

      // Peak hold logic
      if (scaledLeft > peakDecayLeft.current) {
        peakDecayLeft.current = scaledLeft;
        peakHoldLeft.current = 30; // Hold for 30 frames
      } else if (peakHoldLeft.current > 0) {
        peakHoldLeft.current--;
      } else {
        peakDecayLeft.current *= DECAY_RATE;
      }

      if (scaledRight > peakDecayRight.current) {
        peakDecayRight.current = scaledRight;
        peakHoldRight.current = 30;
      } else if (peakHoldRight.current > 0) {
        peakHoldRight.current--;
      } else {
        peakDecayRight.current *= DECAY_RATE;
      }

      setPeakLeft(peakDecayLeft.current);
      setPeakRight(peakDecayRight.current);

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
    
    // Green for lower levels, yellow for mid, red for high
    if (index < 7) {
      return isPeak ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-green-500";
    } else if (index < 10) {
      return isPeak ? "bg-yellow-400 shadow-yellow-400/50 shadow-sm" : "bg-yellow-500";
    } else {
      return isPeak ? "bg-red-400 shadow-red-400/50 shadow-sm" : "bg-red-500";
    }
  };

  const renderMeter = (level: number, peak: number, label: string) => {
    const activeLEDs = Math.floor(level * LED_COUNT);
    const peakLED = Math.floor(peak * LED_COUNT);

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          {label}
        </span>
        <div className="flex flex-col-reverse gap-[2px]">
          {Array.from({ length: LED_COUNT }).map((_, index) => {
            const isActive = index < activeLEDs;
            const isPeak = index === peakLED && peak > 0.05;
            
            return (
              <div
                key={index}
                className={cn(
                  "w-8 h-2 rounded-sm transition-all duration-75",
                  getLEDColor(index, isActive, isPeak)
                )}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-4 flex items-center justify-center gap-6">
      <div className="flex items-end gap-4">
        {renderMeter(leftLevel, peakLeft, "L")}
        {renderMeter(rightLevel, peakRight, "R")}
      </div>
      <div className="flex flex-col justify-between h-full text-[8px] text-muted-foreground/70 py-1">
        <span>+6</span>
        <span>0</span>
        <span>-6</span>
        <span>-12</span>
        <span>-∞</span>
      </div>
    </div>
  );
};

export default VUMeter;
