import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Backend API URL

export const signupUser = async (fullName, email, password) => {
  //
  try {
    console.log("Submitting signup details...");
    const response = await axios.post(`${API_URL}/signup`, {
      fullName,
      email,
      password,
    });
    console.log("Response from backend:", response); // Debugging log
    return response.data;
  } catch (error) {
    console.error("Signup error:", error); // Log the entire error
    if (error.response) {
      // Server responded with a status code other than 2xx
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      throw { message: "No response from server" };
    } else {
      // Something else happened
      throw { message: "Signup failed" };
    }
  }
};


export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    console.log("Response from backend:", response.data);

    return response.data; // This contains the token & userId
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : { message: "Login failed" };
  }
};
