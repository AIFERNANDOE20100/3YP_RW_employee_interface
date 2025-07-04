import React, { useState } from "react";
import api from "../../services/api"; // 
import "./tick_button.css";

const TickButton = ({ orderId }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // to disable after completion
  const [loading, setLoading] = useState(false);

  const handleTickClick = () => {
    if (!isCompleted) {
      setShowPopup(true);
    }
  };

  const handleConfirm = async () => {
  setLoading(true);
  const idToken = localStorage.getItem("token");
  if (!idToken) {
    console.error("No token found. Please log in.");
    setLoading(false);
    setShowPopup(false);
    return;
  }

  try {
    await api.patch(
      `/api/orders/markCompleted/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    setIsCompleted(true);

    // Dispatch event to refresh order list
    window.dispatchEvent(new Event("order-submitted"));
  } catch (error) {
    console.error("Failed to mark order as completed:", error);
  }

  setLoading(false);
  setShowPopup(false);
};

  const handleCancel = () => {
    setShowPopup(false);
  };

  return (
    <>
      <button
        className="tick-button"
        onClick={handleTickClick}
        title="Mark as Completed"
        disabled={isCompleted}
      >
        ✓
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>Mark this order as completed?</p>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TickButton;
