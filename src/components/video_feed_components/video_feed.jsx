import { useEffect, useRef, useState } from 'react';
import './video_feed.css';
import VideoButton from './video_button.jsx';

const VideoFeed = () => {
  const imgRef = useRef(null);
  const socketRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = () => {
    console.log('[+] Starting video stream...');
    socketRef.current = new WebSocket('ws://localhost:5000/video-stream'); // Your backend proxy endpoint

    socketRef.current.onopen = () => {
      console.log('[+] Connected to video stream');
      setIsStreaming(true);
    };

    socketRef.current.onmessage = (event) => {
      console.log('[+] Received message from stream');
      if (event.data) {
        console.log('[+] Data packet:', event.data);  // Log raw packet

        // Ensure it's a Blob, then create a URL for it
        if (event.data instanceof Blob) {
          const url = URL.createObjectURL(event.data); // Create a URL for the blob
          console.log('[+] Blob URL:', url);

          // Check if the imgRef is valid before updating the src
          if (imgRef.current) {
            imgRef.current.src = url;  // Set the src of the img tag to the URL
          }

          // Revoke the previous URL after a small delay to avoid memory leaks
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      } else {
        console.warn('[!] Empty or invalid message received');
      }
    };

    socketRef.current.onclose = () => {
      console.log('[x] Video stream connection closed');
      setIsStreaming(false);
    };

    socketRef.current.onerror = (err) => {
      console.error('[!] WebSocket error:', err);
      setIsStreaming(false);
    };
  };

  const stopStream = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => stopStream(); // Cleanup on unmount
  }, []);

  return (
    <div className="video-feed-container">
      <div className="video-wrapper">
        <img ref={imgRef} alt="Live Video Feed" className="video" />
      </div>
      <div className="controls">
        {!isStreaming ? (
          <VideoButton onClick={startStream} variant="default">Start Stream</VideoButton>
        ) : (
          <VideoButton onClick={stopStream} variant="destructive">Stop Stream</VideoButton>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
