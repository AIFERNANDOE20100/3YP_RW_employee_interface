import React, { useEffect, useState } from "react";
import { BatteryFull, Activity } from "lucide-react";
import "./robot_status.css";
import api from "../../services/api";

const RobotStatus = () => {
  // State to hold battery and performance data
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [performanceStatus, setPerformanceStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get("/api/batteryStatus");
        const data = response.data;
        console.log("Received data from backend:", data); // Debug log
        if (response.status === 200) {
          setBatteryPercentage(data.batteryPercentage);
          setPerformanceStatus(data.performanceStatus);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching battery status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Fetch every 5s

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="robot-status-container">
      <h2 className="title">Robot Status</h2>

      {/* Battery Section */}
      <div className="status-row">
        <BatteryFull className="icon" />
        <span className="batteryPercentage">
          {batteryPercentage !== null ? `${batteryPercentage}%` : "Loading..."}
        </span>
      </div>

      {/* Performance Section */}
      <div className="status-row">
        <Activity className="icon" />
        <span className="performanceStatus">
          {performanceStatus !== null ? `${performanceStatus}%` : "Loading..."}
        </span>
      </div>
    </div>
  );
};

export default RobotStatus;
