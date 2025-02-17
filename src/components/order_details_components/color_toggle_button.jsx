import { useState } from "react";
import "./color_toggle_button.css";

const ColorToggleButton = () => {
  const [isGreen, setIsGreen] = useState(true);

  const toggleColor = () => {
    setIsGreen((prev) => !prev);
  };

  return (
    <button
      className={`toggle-button ${isGreen ? "green" : "red"}`}
      onClick={toggleColor}
    />
  );
};

export default ColorToggleButton;
