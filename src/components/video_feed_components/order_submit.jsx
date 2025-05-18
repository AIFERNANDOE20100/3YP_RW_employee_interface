import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import "./order_submit.css";

const OrderSubmit = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [itemDetails, setItemDetails] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const restaurantId = localStorage.getItem("restaurantId");
  const robotId = localStorage.getItem("selectedRobotId");
  console.log("Robot ID:", robotId);
  console.log("Restaurant ID:", restaurantId);

  useEffect(() => {
    if (!restaurantId) return;
    api
      .get(`/api/menu-items?restaurantId=${restaurantId}`)
      .then((res) => {
        const sortedItems = res.data.sort(
          (a, b) => a.menuNumber - b.menuNumber
        );
        setMenuItems(sortedItems);
      })
      .catch((err) => console.error("Failed to fetch menu items:", err));
  }, [restaurantId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const toggleItem = (item) => {
    const isSelected = selectedItems.find((i) => i.id === item.id);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
      setItemDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[item.id];
        return newDetails;
      });
      setItemQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[item.id];
        return newQuantities;
      });
    } else {
      setSelectedItems((prev) => [...prev, item]);
      setItemDetails((prev) => ({ ...prev, [item.id]: "" }));
      setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    }
  };

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNo || selectedItems.length === 0) {
      return alert("Fill all required fields");
    }

    const orderItems = selectedItems.map((item) => ({
      menuNumber: item.menuNumber,
      name: item.name,
      quantity: itemQuantities[item.id] || 1,
      extraDetails: itemDetails[item.id] || "",
    }));

    const totalQuantity = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    try {
      await api.post("/api/orders/submitOrders", {
        tableNo,
        restaurantId,
        userId,
        robotId,
        items: orderItems,
        totalQuantity,
        status : "active",
      });

      alert("Order submitted!");
      setSelectedItems([]);
      setItemDetails({});
      setItemQuantities({});
      setTableNo("");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to submit order:", err);
      alert("Failed to submit order");
    }
  };

  return (
    <div className="order-wrapper" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="food-btn">
        <img src="src/assets/food_icon.jpg" alt="food" className="food-img" />
      </button>

      {isOpen && (
        <form className="order-form" onSubmit={handleSubmit}>
          <label htmlFor="tableNo">Table Number</label>
          <select
            id="tableNo"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            required
          >
            <option value="">Select a table</option>
            {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                Table {num}
              </option>
            ))}
          </select>

          <label>Select Items</label>
          <div className="menu-items-list">
            {menuItems.length === 0 ? (
              <p className="no-items">No items found.</p>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="menu-item">
                  <label className="menu-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.some((i) => i.id === item.id)}
                      onChange={() => toggleItem(item)}
                    />
                    <span>{`[${item.menuNumber}] ${item.name} - $${item.price}`}</span>
                  </label>

                  {selectedItems.some((i) => i.id === item.id) && (
                    <>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <span className="qty-display">
                          {itemQuantities[item.id] || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Extra details"
                        value={itemDetails[item.id] || ""}
                        onChange={(e) =>
                          setItemDetails((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="extra-details-input"
                      />
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <button type="submit" className="submit-btn">
            Submit Order
          </button>
        </form>
      )}
    </div>
  );
};

export default OrderSubmit;
