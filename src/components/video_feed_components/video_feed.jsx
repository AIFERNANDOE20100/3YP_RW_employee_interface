import { useEffect, useRef, useState } from 'react';
import './video_feed.css';
import VideoButton from './video_button.jsx';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBubdSfljjucCKUUwEwh15EtZFLywbsGEQ",
  authDomain: "test-webrtc-f155e.firebaseapp.com",
  projectId: "test-webrtc-f155e",
  storageBucket: "test-webrtc-f155e.appspot.com",
  messagingSenderId: "674163171327",
  appId: "1:674163171327:web:c8f988f1605a01bd9291ca",
  measurementId: "G-VV8L1PP7GZ"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:relay.metered.ca:80',
      username: 'openai',
      credential: 'openai'
    },
    {
      urls: 'turn:relay.metered.ca:443',
      username: 'openai',
      credential: 'openai'
    }
  ],
  iceCandidatePoolSize: 10,
};

const VideoFeed = ({ mqttClient, mqttTopic }) => {
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const pcRef = useRef(null);

  // ArUco detection states
  const [isArUcoActive, setIsArUcoActive] = useState(false);
  const [arUcoWebSocket, setArUcoWebSocket] = useState(null);
  const [arUcoResults, setArUcoResults] = useState(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Refs for managing command processing
  const currentCommandsToProcessRef = useRef([]); // The list of commands from the *current* message
  const commandIndexRef = useRef(0); // Index for the current command being processed
  const isProcessingCommandsRef = useRef(false); // Flag to indicate if command publishing is active
  const commandTimeoutRef = useRef(null); // Timeout ID for the delay between commands

  // New refs for video freeze detection
  const lastFramesReceivedRef = useRef(0);
  const lastVideoStatsTimestampRef = useRef(0);
  const videoFrozenDetectedRef = useRef(false);
  const statsIntervalIdRef = useRef(null); // To store the setInterval ID

  // Define target FPS and calculate interval
  const TARGET_FPS = 5;
  const FRAME_INTERVAL = 1000 / TARGET_FPS; // Milliseconds per frame

  // Function to stop command processing and reset state
  const stopProcessingCommands = () => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    isProcessingCommandsRef.current = false;
    currentCommandsToProcessRef.current = [];
    commandIndexRef.current = 0;
    console.log("Command processing stopped.");
    // Optionally send a 'STOP' command to the robot if it's not already handled by the ArUco server
    // if (mqttClient && mqttTopic) {
    //   mqttClient.publish(mqttTopic.toString(), JSON.stringify({ key: "STOP", timestamp: Date.now(), duration: 0.1 }), 1);
    // }
  };

  // New function to start processing a fresh set of commands
  const startProcessingNewCommands = (commands) => {
    // Clear any existing processing
    if (commandTimeoutRef.current) { 
      clearTimeout(commandTimeoutRef.current);
    }
    isProcessingCommandsRef.current = true;
    currentCommandsToProcessRef.current = commands;
    commandIndexRef.current = 0;
    processNextCommand(); // Start processing the new set
  };

  // Function to process the next command in the current list
  const processNextCommand = () => {
    if (!mqttClient || !mqttTopic) {
        console.warn("MQTT client or topic not available for command publishing.");
        stopProcessingCommands();
        return;
    }

    while (commandIndexRef.current < currentCommandsToProcessRef.current.length) {
      const command = currentCommandsToProcessRef.current[commandIndexRef.current];
      console.log(`Processing command: ${command}`);
      console.log(`Publishing command to MQTT: ${command}`);
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ key: command, timestamp: Date.now(), duration: 0.1 }), 1);

      commandIndexRef.current += 1;
      // Schedule the next command after a 1.5-second delay
      commandTimeoutRef.current = setTimeout(processNextCommand, 5000);
    }
      // All commands in the current set have been published
    stopProcessingCommands();
  };

  // Function to check for video stream freeze
  const checkVideoFreeze = async () => {
    if (!pcRef.current || pcRef.current.connectionState !== 'connected') {
      // If peer connection is not active, no need to check for freeze
      return;
    }

    try {
      const statsReport = await pcRef.current.getStats(null); // Get stats for the entire connection
      let currentFramesReceived = 0;
      let currentTimestamp = 0;

      statsReport.forEach(report => {
        // Look for inbound video RTP stream statistics
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          currentFramesReceived = report.framesReceived;
          currentTimestamp = report.timestamp; // Timestamp of when the report was generated
        }
      });

      // Check if frames received count has not increased over a threshold duration
      const FREEZE_THRESHOLD_MS = 3000; // 3 seconds

      if (lastFramesReceivedRef.current > 0 && 
          currentFramesReceived === lastFramesReceivedRef.current && 
          (currentTimestamp - lastVideoStatsTimestampRef.current) > FREEZE_THRESHOLD_MS) {
        
        if (!videoFrozenDetectedRef.current) {
          console.warn("VIDEO FREEZE DETECTED! Stopping robot commands.");
          console.log(`VIDEO FREEZE DETECTED! Stopping robot commands.`);
          stopProcessingCommands(); // Stop commands if video freezes
          videoFrozenDetectedRef.current = true;
        }
      } else if (currentFramesReceived > lastFramesReceivedRef.current) {
        // If frames are being received again, reset the freeze detection
        if (videoFrozenDetectedRef.current) {
          console.log("Video stream resumed. Commands can potentially resume if new ArUco data arrives.");
          videoFrozenDetectedRef.current = false;
        }
      }

      // Update last known stats
      lastFramesReceivedRef.current = currentFramesReceived;
      lastVideoStatsTimestampRef.current = currentTimestamp;

    } catch (error) {
      console.error("Error fetching WebRTC stats for freeze detection:", error);
      // If there's an error getting stats, assume a problem and stop commands
      if (!videoFrozenDetectedRef.current) {
        console.warn("Error getting WebRTC stats, assuming video issue. Stopping robot commands.");
        stopProcessingCommands();
        videoFrozenDetectedRef.current = true;
      }
    }
  };

  const startCall = async () => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'sendrecv' });

    const callDocRef = doc(collection(firestore, 'calls'));
    const offerCandidatesCol = collection(callDocRef, 'offerCandidates');
    const answerCandidatesCol = collection(callDocRef, 'answerCandidates');

    pc.onicecandidate = event => {
      if (event.candidate) {
        addDoc(offerCandidatesCol, event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;

      if (event.track.kind === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      if (event.track.kind === 'audio' && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getAudioTracks().forEach(track => pc.addTrack(track, stream));

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDocRef, { offer });

    onSnapshot(callDocRef, snapshot => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    onSnapshot(answerCandidatesCol, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    if (mqttClient && mqttTopic) {
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ type: "videocall_on", callId: callDocRef.id, timestamp: Date.now() }), 1);
    }

    setIsCalling(true);
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (mqttClient && mqttTopic) {
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ type: "videocall_off", timestamp: Date.now() }), 1);
    }
    setIsCalling(false);
  };


  // ArUco detection functions
  const startArUcoDetection = () => {
    if (!remoteVideoRef.current || !remoteVideoRef.current.srcObject) {
      // Using a custom message box instead of alert()
      const message = 'No video stream available. Please start a video call first.';
      console.warn(message);
      // You would typically render a modal or a temporary message on the UI here
      // For this example, we'll just log to console.
      return;
    }

    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('Connected to ArUco detection server');
      setArUcoWebSocket(ws);
      setIsArUcoActive(true);
      startFrameCapture(ws); // Pass the WebSocket instance directly
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[ArUco Result]', data);

      if (data.type === 'detection_result') {
        setArUcoResults(data);

        // Process commands only from the most recent message if available
        if (data.markers && data.markers.length > 0) {
          const commands = data.markers[0].commands; // Assuming first marker's commands
          if (commands && commands.length > 0) {
            // Immediately start processing this new set, discarding any ongoing or queued commands
            startProcessingNewCommands(commands);
          } else if (isProcessingCommandsRef.current) {
            // If no commands in the current message but we were processing, stop
            // This handles cases where the marker is lost or 'STOP' is sent as the only command
            stopProcessingCommands();
          }
        } else if (isProcessingCommandsRef.current) {
            // If no markers found and we were processing, stop
            stopProcessingCommands();
        }
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from ArUco detection server');
      setIsArUcoActive(false);
      setArUcoWebSocket(null);
      setArUcoResults(null);
      stopFrameCapture();
      stopProcessingCommands(); // Ensure commands stop on disconnect
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Using a custom message box instead of alert()
      const message = 'Failed to connect to ArUco detection server. Make sure the Python server is running on localhost:8765';
      console.error(message);
      // You would typically render a modal or a temporary message on the UI here
      stopProcessingCommands(); // Ensure commands stop on error
    };
  };

  const stopArUcoDetection = () => {
    if (arUcoWebSocket) {
      arUcoWebSocket.close();
    }
    stopFrameCapture();
    setIsArUcoActive(false);
    setArUcoWebSocket(null);
    setArUcoResults(null);
    stopProcessingCommands(); // Ensure commands stop when manually stopping detection
  };

  const startFrameCapture = (wsInstance) => {
    if (!canvasRef.current || !remoteVideoRef.current) return;

    const canvas = canvasRef.current;
    const video = remoteVideoRef.current;
    const ctx = canvas.getContext('2d');

    let lastFrameTime = 0;

    const captureFrame = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(captureFrame);

      if (!video || !wsInstance || wsInstance.readyState !== WebSocket.OPEN || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      if (currentTime - lastFrameTime < FRAME_INTERVAL) {
        return;
      }

      lastFrameTime = currentTime;

      console.log('Capturing and sending frame...');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result;
          if (wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify({
              type: 'frame',
              data: base64Data
            }));
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };

    animationFrameRef.current = requestAnimationFrame(captureFrame);
  };

  const stopFrameCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Effect hook to manage the video freeze detection interval
  useEffect(() => {
    if (isCalling) {
      // Start checking for video freeze when a call is active
      statsIntervalIdRef.current = setInterval(checkVideoFreeze, 1000); // Check every 1 second
    } else {
      // Clear the interval when the call ends
      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
        statsIntervalIdRef.current = null;
      }
      // Reset freeze detection state when call ends
      lastFramesReceivedRef.current = 0;
      lastVideoStatsTimestampRef.current = 0;
      videoFrozenDetectedRef.current = false;
    }

    // Cleanup function for the effect
    return () => {
      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
        statsIntervalIdRef.current = null;
      }
    };
  }, [isCalling]); // Re-run this effect when isCalling changes

  // General cleanup on component unmount
  useEffect(() => () => {
    endCall();
    stopArUcoDetection();
    stopProcessingCommands(); // Final cleanup on unmount
    if (statsIntervalIdRef.current) {
      clearInterval(statsIntervalIdRef.current);
      statsIntervalIdRef.current = null;
    }
  }, []);

  return (
    <div className="video-feed-container">
      <div className="grid-item video-box">
        <div className="video-wrapper">
          <video ref={remoteVideoRef} autoPlay playsInline className="video" />
          <audio ref={remoteAudioRef} autoPlay playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* ArUco Results Display */}
        {arUcoResults && (
          <div className="aruco-results" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            maxWidth: '300px'
          }}>
            <h4>ArUco Detection Results</h4>
            <p>Markers found: {arUcoResults.markers_count}</p>
            {arUcoResults.markers.map((marker, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>ID {marker.id}:</strong><br />
                Center X: {marker.center_x}<br />
                Horizontal Centering: {marker.horizontal_centering_percentage.toFixed(1)}%<br />
                Direction: {marker.direction}<br />
                {marker.distance_mm && (
                  <>
                    Distance: {marker.distance_mm.toFixed(1)}mm<br />
                    Pitch: {marker.pitch_deg.toFixed(1)}°<br />
                  </>
                )}
                {/* Displaying commands */}
                {marker.commands && marker.commands.length > 0 && (
                  <>
                    Commands: {marker.commands.join(', ')}<br />
                  </>
                )}
              </div>
            ))}
            <p>FPS: {arUcoResults.statistics.fps.toFixed(1)}</p>
            <p>Detection Rate: {arUcoResults.statistics.detection_rate.toFixed(1)}%</p>
          </div>
        )}
      </div>

      <div className="controls">
        {!isCalling ? (
          <VideoButton onClick={startCall} variant="default">Start Video Call</VideoButton>
        ) : (
          <VideoButton onClick={endCall} variant="destructive">End Call</VideoButton>
        )}

        {isCalling && (
          <div style={{ marginTop: '10px' }}>
            {!isArUcoActive ? (
              <VideoButton onClick={startArUcoDetection} variant="default">Plug to Charging</VideoButton>
            ) : (
              <VideoButton onClick={stopArUcoDetection} variant="destructive">Stop Autonavigation</VideoButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
