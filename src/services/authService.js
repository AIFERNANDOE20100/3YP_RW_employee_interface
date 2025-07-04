import api from "./api";

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/api/auth/reset-password", { email });
    return response.data;
  } catch (error) {
    console.error("Password reset error:", error);
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: "No response from server" };
    } else {
      throw { message: "Failed to send reset email" };
    }
  }
};

export const signupUser = async (fullName, email, password) => {
  //
  try {
    console.log("Submitting signup details...");
    const response = await api.post(`/api/auth/signup`, {
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
    const response = await api.post(`/api/auth/login`, { email, password });
    console.log("Response from backend:", response.data);
    return response.data; // This contains the token & userId
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : { message: "Login failed" };
  }
};
