import { BatteryFull, Activity } from "lucide-react";
import "./robot_status.css";

const RobotStatus = ({ batteryPercentage, performanceStatus }) => {
  return (
    <div className="robot-status-container">
      <h2 className="title">Robot Status</h2>

      {/* Battery Section */}
      <div className="status-row">
        <BatteryFull className="icon" />
        <span className="batteryPercentage">{batteryPercentage}%</span>
      </div>

      {/* Performance Section */}
      <div className="status-row">
        <Activity className="icon" />
        <span className="performanceStatus">{performanceStatus}%</span>
      </div>
    </div>
  );
};

export default RobotStatus;
