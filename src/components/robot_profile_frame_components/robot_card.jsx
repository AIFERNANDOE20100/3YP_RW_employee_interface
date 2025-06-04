import React from "react";
import "./robot_card.css";

const RobotCard = ({ name, description, status, imageUrl, onClick }) => {
  return (
    <button className="robot-card" onClick={onClick}>
      <img src={"https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?ga=GA1.1.1902603618.1746611229&semt=ais_hybrid&w=740"} alt={name} className="robot-image" />
      <div className="robot-info">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </button>
  );
};

export default RobotCard;
