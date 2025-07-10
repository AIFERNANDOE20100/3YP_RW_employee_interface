// video_feed_page.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./video_feed_page.css";
import {
  mqtt,
  iot,
  io,
} from "aws-iot-device-sdk-v2";

import VideoFeed from "../components/video_feed_components/video_feed.jsx";
import OrderDetails from "../components/order_details_components/order_details.jsx";
import RobotStatus from "../components/robot_status_components/robot_status.jsx";
import OrderSubmit from "../components/video_feed_components/order_submit.jsx";

const VideoFeedPage = () => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [keysPressed, setKeysPressed] = useState({});
  const [intervals, setIntervals] = useState({});
  const [battery, setBattery] = useState(null);


  const topic = localStorage.getItem("topic");

  const sendMQTTMessage = (type) => {
    if (client && connected && topic) {
      const message = {
        type,
        timestamp: new Date().toISOString(),
      };
      client.publish(topic.toString(), JSON.stringify(message), mqtt.QoS.AtLeastOnce);
    }
  };
  
  const navigate = useNavigate();

  const handleManualDisconnect = () => {
    sendMQTTMessage("disconnect");
    if (client) {
      client.disconnect();
    }
    navigate(-1); // Go back to the previous page
  };


  useEffect(() => {
    let connection = null;

    const connectToAwsIoT = async () => {
      const accessKey = localStorage.getItem("awsAccessKey");
      const secretKey = localStorage.getItem("awsSecretKey");
      const sessionToken = localStorage.getItem("awsSessionToken");
      const region = localStorage.getItem("awsRegion");
      const host = localStorage.getItem("awsHost");

      if (!accessKey || !secretKey || !sessionToken || !region || !host) return;

      const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(false)
        .with_client_id("reactClient_" + Math.random().toString(16).substr(2, 8))
        .with_endpoint(host)
        .with_credentials(region, accessKey, secretKey, sessionToken)
        .build();

      const clientBootstrap = new io.ClientBootstrap();
      const mqttClient = new mqtt.MqttClient(clientBootstrap);
      connection = mqttClient.new_connection(config);

      connection.on("connect", async () => {
          setConnected(true);

          const sessionState = sessionStorage.getItem("visited");
          if (sessionState) {
            sendMQTTMessage("reconnect");
          } else {
            sessionStorage.setItem("visited", "true");
          }

          // Subscribe to the topic and handle all types of messages
          await connection.subscribe(topic, mqtt.QoS.AtMostOnce, (topic, payload) => {
            try {
              const message = JSON.parse(new TextDecoder().decode(payload));
              console.log("📩 MQTT Message Received:", message);

              // Battery percentage update
              if ("battery_percentage" in message) {
                setBattery(message.battery_percentage);
              }

              // You can handle other types like control, alerts, etc., here too
            } catch (err) {
              console.error("❌ Failed to parse MQTT message:", err);
            }
          });
        });

      connection.on("disconnect", () => setConnected(false));
      connection.on("error", () => setConnected(false));

      try {
        await connection.connect();
        setClient(connection);
      } catch (err) {
        console.error("MQTT connection failed:", err);
      }
    };

    connectToAwsIoT();

    return () => {
      if (connection) {
        connection.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const navType = performance.getEntriesByType("navigation")[0]?.type;
      if (client && connected) {
        if (navType === "reload") {
          sendMQTTMessage("reconnect");
        } else {
          sendMQTTMessage("disconnect");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [client, connected]);

  const sendKeyPressToMQTT = (key, action) => {
    if (!client || !connected) return;

    const message = {
      key,
    };
    client.publish(topic.toString(), JSON.stringify(message), mqtt.QoS.AtMostOnce);
  };

  



  const handleKeyPress = (event) => {
    if (keysPressed[event.key]) return;

    setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
    sendKeyPressToMQTT(event.key, "keydown");

    const intervalId = setInterval(() => {
      sendKeyPressToMQTT(event.key, "keydown");
    }, 200);

    setIntervals((prev) => ({ ...prev, [event.key]: intervalId }));
  };

  const handleKeyRelease = (event) => {
    setKeysPressed((prev) => {
      const updated = { ...prev };
      delete updated[event.key];
      return updated;
    });

    clearInterval(intervals[event.key]);

    setIntervals((prev) => {
      const updated = { ...prev };
      delete updated[event.key];
      return updated;
    });

    sendKeyPressToMQTT(event.key, "keyup");
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyRelease);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyRelease);
      Object.values(intervals).forEach(clearInterval);
    };
  }, [client, connected, keysPressed, intervals]);

  return (
    <div className="parent">
      <div className="order-details-submit-btn">
        <OrderSubmit />
        <button onClick={handleManualDisconnect} className="disconnect-button">
          Disconnect
        </button>
      </div>
      <div className="large">
        <VideoFeed mqttClient={client} mqttTopic={topic} />
      </div>
      <div className="small">
        <OrderDetails />
      </div>
      <div className="small">
        <RobotStatus batteryPercentage={battery} />
      </div>
    </div>
  );
};
export default VideoFeedPage;
