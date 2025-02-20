import React from 'react';
import './robot_page.css';
import RobotCard from '../components/robot_profile_frame_components/robot_card.jsx';
import { useNavigate } from "react-router-dom";
import Profile from '../components/profile/profile.jsx';

const RobotPage = ({ items }) => {
    const navigate = useNavigate();

    const handleCardClick = (name) => {
        navigate("/videofeed");
    };

    return (
        <div className="robot-page-container">
            {/* Move Profile to the top-right corner */}
            <div className="profile-container">
                <Profile />
            </div>

            <div className="grid-container">
                {items.map((item, index) => (
                    <RobotCard
                        key={index}
                        {...item}
                        onClick={() => handleCardClick(item.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RobotPage;
