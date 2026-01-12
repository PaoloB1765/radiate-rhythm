import React, { useState, useRef } from "react";
import { Cast, Airplay, Share2, Check, Copy } from "lucide-react";
import { useCasting } from "@/hooks/useCasting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const STREAM_URL = "https://vrs-blackbox.ddns.net/listen/vrs/radio.mp3";

interface CastButtonProps {
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const CastButton: React.FC<CastButtonProps> = ({ audioRef }) => {
  const { startAirPlay, shareForCasting, isAirPlayAvailable, getCastUrl } = useCasting(STREAM_URL);
  const [copied, setCopied] = useState(false);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleAirPlay = () => {
    const audio = audioRef?.current || internalAudioRef.current;
    if (audio) {
      startAirPlay(audio);
    }
  };

  const handleShare = async () => {
    const success = await shareForCasting();
    if (success && !navigator.share) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getCastUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <>
      {/* Hidden audio element for AirPlay if no external ref provided */}
      {!audioRef && (
        <audio 
          ref={internalAudioRef} 
          src={STREAM_URL} 
          style={{ display: 'none' }} 
        />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Trasmetti a dispositivo"
          >
            <Cast className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-zinc-900/95 backdrop-blur-sm border-white/10"
        >
          <DropdownMenuLabel className="text-white/60 text-xs">
            Trasmetti audio
          </DropdownMenuLabel>
          
          {isAirPlayAvailable && (
            <DropdownMenuItem 
              onClick={handleAirPlay}
              className="text-white hover:bg-white/10 cursor-pointer gap-2"
            >
              <Airplay className="h-4 w-4" />
              <span>AirPlay</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={handleShare}
            className="text-white hover:bg-white/10 cursor-pointer gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Condividi stream</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <DropdownMenuItem 
            onClick={handleCopyUrl}
            className="text-white hover:bg-white/10 cursor-pointer gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-green-400">URL copiato!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copia URL stream</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <div className="px-2 py-2 text-xs text-white/40">
            <p className="mb-1">
              <strong>Chromecast:</strong> Usa il pulsante Cast nel browser Chrome
            </p>
            <p>
              <strong>AirPlay:</strong> Disponibile in Safari su macOS/iOS
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CastButton;
