import { useEffect } from "react";
import "./video_feed_page.css";
import VideoFeed from "../components/video_feed_components/video_feed.jsx";
import OrderDetails from "../components/order_details_components/order_details.jsx";
import RobotStatus from "../components/robot_status_components/robot_status.jsx";

const VideoFeedPage = () => {
  const handleKeyPress = (event) => {
    const keyPressed = event.key;

    // Send key press information to the server
    fetch("http://localhost:3000/api/keyPress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: keyPressed }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Server Response:", data))
      .catch((error) => console.error("Error:", error));

    switch (keyPressed) {
      case "ArrowUp":
        alert("Up arrow pressed");
        break;
      case "ArrowDown":
        alert("Down arrow pressed");
        break;
      case "ArrowLeft":
        alert("Left arrow pressed");
        break;
      case "ArrowRight":
        alert("Right arrow pressed");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="parent">
      <div className="large">
        <VideoFeed />
      </div>
      <div className="small">
        <OrderDetails />
      </div>
      <div className="small">
        <RobotStatus batteryPercentage={80} performanceStatus={20} />
      </div>
    </div>
  );
};

export default VideoFeedPage;
