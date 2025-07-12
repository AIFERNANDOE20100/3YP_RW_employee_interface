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
  const remoteAudioRef = useRef(null); // <-- added
  const [isCalling, setIsCalling] = useState(false);
  const pcRef = useRef(null);

  const startCall = async () => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

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

  useEffect(() => () => endCall(), []);

  return (
    <div className="video-feed-container">
      <div className="grid-item video-box">
        <div className="video-wrapper">
          <video ref={remoteVideoRef} autoPlay playsInline className="video" />
          <audio ref={remoteAudioRef} autoPlay playsInline />
        </div>
      </div>
      <div className="controls">
        {!isCalling ? (
          <VideoButton onClick={startCall} variant="default">Start Video Call</VideoButton>
        ) : (
          <VideoButton onClick={endCall} variant="destructive">End Call</VideoButton>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
