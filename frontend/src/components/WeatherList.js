import React, { useEffect, useState } from "react";
import { getWeatherLogs } from "../services/api";

export default function WeatherList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getWeatherLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Hava Durumu Kayıtları</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {new Date(log.created_at).toLocaleString()} - {log.temperature}°C - {log.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
