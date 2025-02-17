import ColorToggleButton from "./color_toggle_button.jsx";
import "./details_display.css";

const ContainerBox = () => {
  return (
    <div className="container-box">
      <div className="content">
        <p className="label">Customer Details: <span className="customer-details">John Doe Table 7</span></p>
        <p className="label">Order No: <span className="order-no">78</span></p>
      </div>
      <div className="button-container">
        <ColorToggleButton />
      </div>
    </div>
  );
};

export default ContainerBox;
