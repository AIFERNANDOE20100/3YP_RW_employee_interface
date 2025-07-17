import React from "react";
import { BatteryFull, Activity } from "lucide-react";
import "./robot_status.css";

const RobotStatus = ({ batteryPercentage }) => {
  return (
    <div className="robot-status-container">
      <h2 className="title">Robot Status</h2>

      {/* Battery Section */}
      <div className="status-row">
        <BatteryFull className="icon" />
        <span className="batteryPercentage">
          {batteryPercentage !== null ? `${batteryPercentage}%` : "90"}
        </span>
      </div>

      {/* Performance Section (optional: static or future MQTT-based) */}
      <div className="status-row">
        <Activity className="icon" />
        <span className="performanceStatus">Live</span>
      </div>
    </div>
  );
};

export default RobotStatus;
