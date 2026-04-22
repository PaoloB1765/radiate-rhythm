import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface VinylDiscProps {
  isPlaying: boolean;
  coverArt?: string;
  className?: string;
  duration?: number;
  elapsed?: number;
}

const VinylDisc = ({ isPlaying, coverArt, className, duration = 0, elapsed = 0 }: VinylDiscProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [displayedCover, setDisplayedCover] = useState(coverArt);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  // Scenic artwork transition: fade out + flip, swap, fade in
  useEffect(() => {
    if (coverArt === displayedCover) return;
    setIsTransitioning(true);
    const swapTimer = setTimeout(() => {
      setDisplayedCover(coverArt);
    }, 450);
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 900);
    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [coverArt, displayedCover]);

  // Pause CSS animations when page is hidden (battery optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Outer glow - simplified for performance */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/15 blur-xl",
          isPlaying && isPageVisible ? "animate-pulse-glow" : ""
        )} />
        
        {/* Vinyl disc */}
        <div
          className={cn(
            "relative w-64 h-64 md:w-80 md:h-80 rounded-full",
            "bg-vinyl-dark shadow-2xl",
            "transition-all duration-500",
            // Pause animation when page is hidden (battery optimization)
            isPlaying && isPageVisible ? "animate-spin-slow" : ""
          )}
          style={{
            background: `
              radial-gradient(circle at center,
                transparent 0%,
                transparent 15%,
                hsl(var(--vinyl-groove)) 15.5%,
                hsl(var(--vinyl-dark)) 16%,
                hsl(var(--vinyl-dark)) 18%,
                hsl(var(--vinyl-groove)) 18.5%,
                hsl(var(--vinyl-dark)) 19%,
                hsl(var(--vinyl-dark)) 25%,
                hsl(var(--vinyl-groove)) 25.5%,
                hsl(var(--vinyl-dark)) 26%,
                hsl(var(--vinyl-dark)) 35%,
                hsl(var(--vinyl-groove)) 35.5%,
                hsl(var(--vinyl-dark)) 36%,
                hsl(var(--vinyl-dark)) 45%,
                hsl(var(--vinyl-groove)) 45.5%,
                hsl(var(--vinyl-dark)) 46%,
                hsl(var(--vinyl-dark)) 55%,
                hsl(var(--vinyl-groove)) 55.5%,
                hsl(var(--vinyl-dark)) 56%,
                hsl(var(--vinyl-dark)) 65%,
                hsl(var(--vinyl-groove)) 65.5%,
                hsl(var(--vinyl-dark)) 66%,
                hsl(var(--vinyl-dark)) 75%,
                hsl(var(--vinyl-groove)) 75.5%,
                hsl(var(--vinyl-dark)) 76%,
                hsl(var(--vinyl-dark)) 85%,
                hsl(var(--vinyl-groove)) 85.5%,
                hsl(var(--vinyl-dark)) 86%,
                hsl(var(--vinyl-dark)) 100%
              )
            `,
          }}
        >
          {/* Light reflection */}
          <div 
            className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)'
            }}
          />
          
          {/* Center label with cover art - clickable */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: '800px' }}
          >
            <button 
              onClick={() => coverArt && setIsDialogOpen(true)}
              className={cn(
                "w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden",
                "border-4 border-vinyl-groove",
                "shadow-inner relative",
                coverArt && "cursor-pointer hover:scale-105"
              )}
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 900ms cubic-bezier(0.65, 0, 0.35, 1)',
                transform: isTransitioning 
                  ? 'rotateY(180deg) scale(0.85)' 
                  : 'rotateY(0deg) scale(1)',
              }}
              disabled={!coverArt}
            >
              {/* Glow flash during transition */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 70%)',
                  opacity: isTransitioning ? 1 : 0,
                  transition: 'opacity 450ms ease-in-out',
                }}
              />
              {displayedCover ? (
                <img 
                  src={displayedCover} 
                  alt="Album cover" 
                  className="w-full h-full object-cover"
                  style={{
                    transition: 'opacity 450ms ease-in-out, filter 450ms ease-in-out',
                    opacity: isTransitioning ? 0.3 : 1,
                    filter: isTransitioning ? 'blur(4px) brightness(1.4)' : 'blur(0) brightness(1)',
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-display text-xl md:text-2xl">VRS</span>
                </div>
              )}
            </button>
          </div>
          
          {/* Center hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background" />
        </div>

        {/* Progress bar - positioned below */}
        {duration > 0 && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[320px] px-4">
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground font-['Arial']">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cover art dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none">
          <DialogTitle className="sr-only">Album Cover</DialogTitle>
          {coverArt && (
            <img 
              src={coverArt} 
              alt="Album cover" 
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VinylDisc;
