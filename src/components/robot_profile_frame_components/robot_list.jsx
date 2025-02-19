import React from "react";
import RobotCard from "./robot_card";
import RoboAlpha from "./robot_alpha.jpg"; // Use relative path

const robots = [
  {
    name: "paniya Alpha",
    description: "AI-powered assistant",
    status: "online",
    imageUrl: RoboAlpha,
  },
  {
    name: "chaz Zeta",
    description: "Security robot",
    status: "offline",
    imageUrl: RoboAlpha,
  },
  {
    name: "koora Nova",
    description: "Warehouse automation",
    status: "online",
    imageUrl: RoboAlpha,
  },
  {
    name: "lalla X",
    description: "Industrial robot",
    status: "offline",
    imageUrl: RoboAlpha,
  },
  {
    name: "koka Bot",
    description: "Medical assistant",
    status: "online",
    imageUrl: RoboAlpha,
  },
];

const RobotList = () => {
  const handleCardClick = (name) => {
    alert(`Entering ${name}...`); // Replace with navigation logic
  };

  return (
    <div className="robot-list">
      {robots.map((robot, index) => (
        <RobotCard
          key={index}
          {...robot}
          onClick={() => handleCardClick(robot.name)}
        />
      ))}
    </div>
  );
};

export default RobotList;
