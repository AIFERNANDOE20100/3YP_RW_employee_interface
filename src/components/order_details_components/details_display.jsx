import React from "react";
import TickButton from "./tick_button.jsx";
import "./details_display.css";

const ContainerBox = ({ tableNo, orderNumber, itemNames, orderId }) => {
  return (
    <div className="container-box">
      <div className="content">
        <p className="label">
          Order No: <span className="order-no">{orderNumber}</span>
        </p>
        <p className="label">
          Table No: <span className="table-no">{tableNo}</span>
        </p>
        <p className="label">
          Items: <span className="item-names">{itemNames}</span>
        </p>
      </div>
      <div className="button-container">
        <TickButton orderId={orderId} />
      </div>
    </div>
  );
};

export default ContainerBox;
