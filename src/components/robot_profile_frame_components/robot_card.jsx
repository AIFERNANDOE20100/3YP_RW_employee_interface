import React from "react";
import "./robot_card.css";

const RobotCard = ({ name, description, status, imageUrl, onClick }) => {
  return (
    <button className="robot-card" onClick={onClick}>
      <img src={"./src/assets/robot.jpg"} alt={name} className="robot-image" />
      <div className="robot-info">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </button>
  );
};

export default RobotCard;
