import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const getWeatherLogs = async () => {
  const res = await axios.get(`${API_BASE}/weather-logs`);
console.log(res.data);

  return res.data.data;
};