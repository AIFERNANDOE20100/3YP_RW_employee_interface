import "./video_feed_page.css";
import VideoFeed from "../components/video_feed_components/video_feed.jsx"
import OrderDetails from "../components/order_details_components/order_details.jsx"
import RobotStatus from "../components/robot_status_components/robot_status.jsx"

const VideoFeedPage = () => {
  return (
    <div className="parent">
      <div className="large"><VideoFeed /></div>
      <div className="small"><OrderDetails /></div>
      <div className="small"><RobotStatus batteryPercentage={80} performanceStatus={20}/></div>
    </div>
  );
};

export default VideoFeedPage;
