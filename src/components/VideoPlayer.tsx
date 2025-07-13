import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Channel, PlayerState } from '../types';

interface VideoPlayerProps {
  channel: Channel | null;
  onError: (error: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false,
    isLoading: false,
    error: null,
  });
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setPlayerState(prev => ({ ...prev, isLoading: true, error: null }));

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadVideo = () => {
      if (channel.url.includes('.m3u8') || channel.url.includes('m3u8')) {
        // HLS stream
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          hlsRef.current = hls;

          hls.loadSource(channel.url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setPlayerState(prev => ({ ...prev, isLoading: false }));
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setPlayerState(prev => ({ ...prev, isLoading: false, error: 'Failed to load stream' }));
              onError(`HLS Error: ${data.details}`);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = channel.url;
          setPlayerState(prev => ({ ...prev, isLoading: false }));
        } else {
          onError('HLS is not supported in this browser');
        }
      } else {
        // Direct video stream
        video.src = channel.url;
        setPlayerState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, onError]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        onError('Failed to play video: ' + err.message);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setPlayerState(prev => ({ ...prev, volume: videoRef.current!.muted ? 0 : 1 }));
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const retry = () => {
    if (channel && videoRef.current) {
      setPlayerState(prev => ({ ...prev, error: null }));
      videoRef.current.load();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlayerState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0,
      }));
    };
    const handleVolumeChange = () => {
      setPlayerState(prev => ({ ...prev, volume: video.muted ? 0 : video.volume }));
    };
    const handleError = () => {
      setPlayerState(prev => ({ ...prev, isLoading: false, error: 'Video playback error' }));
      onError('Video playback failed');
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
    };
  }, [onError]);

  if (!channel) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Play size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg">Select a channel to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 bg-black relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
        onLoadStart={() => setPlayerState(prev => ({ ...prev, isLoading: true }))}
        onCanPlay={() => setPlayerState(prev => ({ ...prev, isLoading: false }))}
      />

      {/* Loading Indicator */}
      {playerState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {playerState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <p className="text-lg font-medium">Playback Error</p>
              <p className="text-sm text-gray-400 mt-2">{playerState.error}</p>
            </div>
            <button
              onClick={retry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Channel Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 rounded-lg p-3 backdrop-blur-sm">
          <h3 className="text-white font-medium">{channel.name}</h3>
          <p className="text-gray-300 text-sm">{channel.category.toUpperCase()}</p>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
            >
              {playerState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={toggleMute}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
            >
              {playerState.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <div className="flex-1"></div>

            <button
              onClick={toggleFullscreen}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;