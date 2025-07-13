import React from "react";
import "./robot_card.css";

const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "green";
    case "in use":
      return "orange";
    case "offline":
      return "red";
    default:
      return "gray";
  }
};

const RobotCard = ({ name, description, status, imageUrl, onClick }) => {
  return (
    <div className="robot-card" onClick={onClick}>
      <img
        src={
          imageUrl ||
          "https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?ga=GA1.1.1902603618.1746611229&semt=ais_hybrid&w=740"
        }
        alt={name}
        className="robot-image"
      />

      <div className="robot-card-header">
        <h3 className="robot-name">{name}</h3>
        <span
          className="status-dot"
          style={{ backgroundColor: getStatusColor(status) }}
          title={status}
        ></span>
      </div>

      <p className="robot-description">{description}</p>
      <p className="robot-status">{status}</p>
    </div>
  );
};

export default RobotCard;
