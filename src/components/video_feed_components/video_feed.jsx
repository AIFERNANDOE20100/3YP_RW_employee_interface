import { useEffect, useRef, useState } from 'react';
import './video_feed.css';
import VideoButton  from './video_button.jsx';

const VideoFeed = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  return (
    <div className="video-feed-container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline className="video" />
      </div>
      <div className="controls">
        {!isStreaming ? (
          <VideoButton onClick={startCamera} variant="default">Start Camera</VideoButton>
        ) : (
          <VideoButton onClick={stopCamera} variant="destructive">Stop Camera</VideoButton>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
