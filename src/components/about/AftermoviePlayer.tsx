"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film } from "lucide-react";

export default function AftermoviePlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#070b1a] border-2 border-[rgba(217,173,98,0.45)] group/player select-none transition-all duration-500 hover:border-[#d9ad62] hover:shadow-[0_0_40px_rgba(217,173,98,0.25)]"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Real Aftermovie Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[440px] object-cover cursor-pointer"
        onClick={togglePlay}
      >
        <source src="/Aftermovie.webm" type="video/webm" />
        Your browser does not support video playback.
      </video>

      {/* Holographic Ambient Glow Frame */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]" />

      {/* Top Left Badge: Fest Year */}
      <div className="absolute top-3 left-3 px-3 py-1 bg-[#090e24]/90 backdrop-blur-md rounded-full text-[11px] font-mono text-[#f5e5c9] border border-[rgba(217,173,98,0.4)] flex items-center gap-1.5 shadow-lg">
        <Film className="w-3 h-3 text-[#d9ad62]" />
        <span>TECHNEX // 2025 REWIND</span>
      </div>

      {/* Top Right Live Telemetry Badge */}
      <div className="absolute top-3 right-3 px-3 py-1 bg-[#090e24]/90 backdrop-blur-md rounded-full text-[11px] font-mono text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>AFTERMOVIE // ACTIVE</span>
      </div>

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgba(12,10,18,0.85)] border-2 border-[#d9ad62] text-[#d9ad62] flex items-center justify-center shadow-[0_0_30px_rgba(217,173,98,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer"
          aria-label="Play Video"
        >
          <Play className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 fill-[#d9ad62]" />
        </button>
      )}

      {/* Unmute Prompt Button when muted */}
      {isMuted && isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute bottom-16 right-4 sm:right-6 px-3.5 py-1.5 rounded-full bg-[rgba(12,10,18,0.92)] border border-[#d9ad62] text-[#d9ad62] text-xs font-mono flex items-center gap-2 shadow-lg backdrop-blur-md hover:bg-[#d9ad62] hover:text-black transition-all cursor-pointer"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>Click to Unmute</span>
        </button>
      )}

      {/* Bottom Sleek Floating Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 sm:px-5 py-3 transition-opacity duration-300 flex flex-col gap-2 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Scrub Bar */}
        <div
          className="relative w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#d9ad62] via-[#f5e5c9] to-[#d9ad62] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 rounded hover:text-[#d9ad62] transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-1 rounded hover:text-[#d9ad62] transition-colors cursor-pointer"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#d9ad62]" />
              )}
            </button>

            <span className="font-mono text-[11px] text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:text-[#d9ad62] transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

