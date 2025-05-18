import React, { useEffect, useState } from "react";
import ContainerBox from "./details_display.jsx";
import "./order_details.css";
import axios from "axios";

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const restaurantId = localStorage.getItem("restaurantId");
      const robotId = localStorage.getItem("selectedRobotId");
      if (!restaurantId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/orders/getOrders?restaurantId=${restaurantId}&robotId=${robotId}`);
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="order-details-wrapper">
      <h2 className="title">Order Details</h2>
      <div className="scroll-container">
        {orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          orders.map((order) => (
            <ContainerBox
              key={order.OrderId}
              tableNo={order.tableNo}
              orderNumber={order.orderNumber}
              orderId={order.OrderId}
              itemNames={order.items.map((item) => item.name).join(", ")}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
