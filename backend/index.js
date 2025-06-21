const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'weatherdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // SSL'i environment variable ile kontrol et
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err));

// CORS middleware - simplified and fixed
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://34.27.53.239',
      'http://35.184.62.157:3001',
      'http://35.184.62.157',
      'https://34.27.53.239',
      'https://35.184.62.157',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Allow all for now, restrict later
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests - FIX: Don't use wildcard
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// JSON middleware
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Weather API",
    database: "Connected"
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Test successful!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Weather fetch endpoint
app.get("/fetch-weather", async (req, res) => {
  try {
    await fetchWeather();
    res.status(200).json({
      success: true,
      message: "Hava durumu başarıyla alındı ve veritabanına kaydedildi."
    });
  } catch (error) {
    console.error('Fetch weather error:', error);
    res.status(500).json({
      success: false,
      message: "Bir hata oluştu.",
      error: error.message
    });
  }
});

// Weather logs endpoint
app.get("/weather-logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await pool.query(
      "SELECT * FROM weather_logs ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get weather logs error:', error);
    res.status(500).json({
      success: false,
      message: "Veriler alınamadı.",
      error: error.message
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Weather API çalışıyor!",
    endpoints: {
      "/health": "Health check",
      "/test": "Test endpoint",
      "/fetch-weather": "Hava durumunu manuel al",
      "/weather-logs": "Son kayıtları görüntüle (?limit=N)"
    },
    info: "Hava durumu her 5 dakikada bir otomatik güncelleniyor."
  });
});

// Weather fetching function
async function fetchWeather() {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY environment variable is not set');
  }
  
  const city = "Ankara";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    console.log('Fetching weather data...');
    const response = await axios.get(url);
    const { temp, humidity, pressure } = response.data.main;
    const description = response.data.weather[0].description;
    const windSpeed = response.data.wind?.speed || 0;

    await pool.query(
      "INSERT INTO weather_logs (temperature, description, humidity, pressure, wind_speed, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [temp, description, humidity, pressure, windSpeed]
    );
    
    const timestamp = new Date().toLocaleString("tr-TR");
    console.log(`[${timestamp}] Weather data saved: ${temp}°C, ${description}, Humidity: ${humidity}%, Pressure: ${pressure}hPa, Wind: ${windSpeed}m/s`);
  } catch (error) {
    const timestamp = new Date().toLocaleString("tr-TR");
    console.error(`[${timestamp}] Error fetching weather:`, error.message);
    throw error;
  }
}

// Cron job
cron.schedule("*/5 * * * *", () => {
  console.log("Cron job running - updating weather data...");
  fetchWeather().catch(err => console.error('Cron job error:', err));
});

// Initial weather fetch
setTimeout(() => {
  console.log("Fetching initial weather data...");
  fetchWeather().catch(err => console.error('Initial fetch error:', err));
}, 5000); // 5 second delay to ensure DB is ready

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down application...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database Host: ${process.env.DB_HOST}`);
  console.log(`Weather API Key: ${process.env.WEATHER_API_KEY ? 'Set' : 'Not Set'}`);
});