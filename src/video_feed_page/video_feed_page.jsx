import { useEffect, useState } from "react";
import "./video_feed_page.css";
import VideoFeed from "../components/video_feed_components/video_feed.jsx";
import OrderDetails from "../components/order_details_components/order_details.jsx";
import RobotStatus from "../components/robot_status_components/robot_status.jsx";

const VideoFeedPage = () => {
  const [keysPressed, setKeysPressed] = useState({});
  const [intervals, setIntervals] = useState({});

  const sendKeyPress = (key) => {
    fetch("http://localhost:5000/api/keyPress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, action: "keydown" }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Server Response:", data))
      .catch((error) => console.error("Error:", error));
  };

  const handleKeyPress = (event) => {
    if (keysPressed[event.key]) return; // Prevent duplicate intervals

    setKeysPressed((prevKeys) => ({
      ...prevKeys,
      [event.key]: true,
    }));

    sendKeyPress(event.key); // Send the first key press immediately

    const intervalId = setInterval(() => sendKeyPress(event.key), 200); // Send continuously every 200ms
    setIntervals((prevIntervals) => ({
      ...prevIntervals,
      [event.key]: intervalId,
    }));
  };

  const handleKeyRelease = (event) => {
    setKeysPressed((prevKeys) => {
      const updatedKeys = { ...prevKeys };
      delete updatedKeys[event.key];
      return updatedKeys;
    });

    clearInterval(intervals[event.key]); // Stop sending when key is released
    setIntervals((prevIntervals) => {
      const updatedIntervals = { ...prevIntervals };
      delete updatedIntervals[event.key];
      return updatedIntervals;
    });

    fetch("http://localhost:3000/api/keyPress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: event.key, action: "keyup" }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Server Response:", data))
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyRelease);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyRelease);
      Object.values(intervals).forEach(clearInterval); // Cleanup intervals on unmount
    };
  }, [keysPressed, intervals]);

  return (
    <div className="parent">
      <div className="large">
        <VideoFeed />
      </div>
      <div className="small">
        <OrderDetails />
      </div>
      <div className="small">
        <RobotStatus />
      </div>
    </div>
  );
};

export default VideoFeedPage;
