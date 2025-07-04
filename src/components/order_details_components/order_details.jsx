import React, { useEffect, useState } from "react";
import ContainerBox from "./details_display.jsx";
import "./order_details.css";
import api from "../../services/api";

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);

useEffect(() => {
  const fetchOrders = async () => {
    const restaurantId = localStorage.getItem("restaurantId");
    const robotId = localStorage.getItem("selectedRobotId");
    if (!restaurantId) return;
    const idToken = localStorage.getItem("token");
    if (!idToken) {
      console.error("No token found. Please log in.");
      return;
    }
    try {
      const res = await api.get(
        `/api/orders/getOrders?restaurantId=${restaurantId}&robotId=${robotId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // Initial fetch
  fetchOrders();

  // Event listener for order refresh
  const handleOrderUpdate = () => {
    fetchOrders(); // Call fetchOrders again when event is dispatched
  };

  window.addEventListener("order-submitted", handleOrderUpdate);

  return () => {
    window.removeEventListener("order-submitted", handleOrderUpdate);
  };
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
