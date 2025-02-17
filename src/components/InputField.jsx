import { useState } from "react";

const InputField = ({ type, placeholder, icon }) => {
  // State to toggle password visibility
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  return (
    <div className="input-wrapper">
      <input
        type={isPasswordShown ? 'text' : type}
        placeholder={placeholder}
        className="input-field"
        // required
      />
      <i className="material-symbols-rounded">{icon}</i>
    </div>
  )
}

export default InputField;
