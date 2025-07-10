import React, { useEffect, useState } from "react"; 
import "./robot_page.css";
import RobotCard from "../components/robot_profile_frame_components/robot_card.jsx";
import { useNavigate } from "react-router-dom";
import Profile from "../components/profile/profile.jsx";
import api from "../services/api.js";

const RobotPage = () => {
  const navigate = useNavigate();
  const [robots, setRobots] = useState([]);
  const restaurantId = localStorage.getItem("restaurantId");

  useEffect(() => {
    const fetchRobots = async () => {
      const idToken = localStorage.getItem("token");
      if (!idToken) {
        console.error("No token found. Please log in.");
        return;
      }
      try {
        const res = await api.get(`/api/${restaurantId}/robots`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        // console.log("Fetched robots:", res.data.robots);
        const rawRobots = res.data.robots;
        const enrichedRobots = rawRobots.map(robot => ({
          robotId: robot.robotId,
          name: robot.name,
          status: "online",
          description: "Delivery Robot"
        }));

        setRobots(enrichedRobots);
      } catch (err) {
        console.error("Failed to fetch robots:", err);
      }
    };

    fetchRobots();
  }, [restaurantId]);

  const handleCardClick = async (robotId) => {
    const idToken = localStorage.getItem("token");
    if (!idToken) {
      console.error("No token found. Please log in.");
      return;
    }
    try {
      await api.get(`/api/${restaurantId}/robots/${robotId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      localStorage.setItem("selectedRobotId", robotId);
      navigate("/videofeed");
    } catch (err) {
      console.error("Failed to fetch robot details:", err);
    }
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
