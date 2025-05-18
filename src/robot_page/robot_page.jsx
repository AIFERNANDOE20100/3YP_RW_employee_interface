import React, { useEffect, useState } from "react";
import "./robot_page.css";
import RobotCard from "../components/robot_profile_frame_components/robot_card.jsx";
import { useNavigate } from "react-router-dom";
import Profile from "../components/profile/profile.jsx";
import axios from "axios";

const RobotPage = () => {
  const navigate = useNavigate();
  const [robots, setRobots] = useState([]);
  const restaurantId = localStorage.getItem("restaurantId");

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/restaurant/${restaurantId}/entities`);
        const rawRobots = res.data.robots;
        console.log("Fetched robots:", robots);
        const enrichedRobots = rawRobots.map(robot => ({
          robotId: robot.robotId,
          name: robot.name,
          status: "online",
          description: "Delivery Robot",
          
        }));

        setRobots(enrichedRobots);
      } catch (err) {
        console.error("Failed to fetch robots:", err);
      }
    };

    fetchRobots();
  }, [restaurantId]);

  const handleCardClick = (robotId) => {
    localStorage.setItem("selectedRobotId", robotId);
    navigate("/videofeed");
  };

  return (
    <div className="robot-page-container">
      <div className="profile-container">
        <Profile />
      </div>

      <div className="grid-container">
        {robots.map((robot) => (
          <RobotCard
            key={robot.robotId}
            name={robot.name}
            description={robot.description}
            status={robot.status}
            imageUrl={robot.imageUrl}
            onClick={() => handleCardClick(robot.robotId)}
          />
        ))}
      </div>
    </div>
  );
};

export default RobotPage;
