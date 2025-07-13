// --- Updated video_feed.jsx ---
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

  // New refs for managing command processing
  const currentCommandsToProcessRef = useRef([]); // The list of commands from the *current* message
  const commandIndexRef = useRef(0); // Index for the current command being processed
  const isProcessingCommandsRef = useRef(false); // Flag to indicate if command publishing is active
  const commandTimeoutRef = useRef(null); // Timeout ID for the delay between commands

  // Define target FPS and calculate interval
  const TARGET_FPS = 5;
  const FRAME_INTERVAL = 1000 / TARGET_FPS; // Milliseconds per frame

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
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ type: "videocall_on", callId: callDocRef.id }), 1);
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
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ type: "videocall_off" }), 1);
    }
    setIsCalling(false);
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

    if (commandIndexRef.current < currentCommandsToProcessRef.current.length) {
      const command = currentCommandsToProcessRef.current[commandIndexRef.current];
      console.log(`Publishing command to MQTT: ${command}`);
      mqttClient.publish(mqttTopic.toString(), JSON.stringify({ type: "robot_command", command: command }), 1);

      commandIndexRef.current += 1;
      // Schedule the next command after a 2-second delay
      commandTimeoutRef.current = setTimeout(processNextCommand, 2000);
    } else {
      // All commands in the current set have been published
      stopProcessingCommands();
    }
  };

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
  };


  // ArUco detection functions
  const startArUcoDetection = () => {
    if (!remoteVideoRef.current || !remoteVideoRef.current.srcObject) {
      alert('No video stream available. Please start a video call first.');
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
      alert('Failed to connect to ArUco detection server. Make sure the Python server is running on localhost:8765');
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

  useEffect(() => () => {
    endCall();
    stopArUcoDetection();
    stopProcessingCommands(); // Final cleanup on unmount
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
              <VideoButton onClick={startArUcoDetection} variant="default">Start ArUco Detection</VideoButton>
            ) : (
              <VideoButton onClick={stopArUcoDetection} variant="destructive">Stop ArUco Detection</VideoButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;