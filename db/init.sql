-- Mevcut tabloyu sil (varsa)
DROP TABLE IF EXISTS weather_logs;

-- Gelişmiş weather_logs tablosunu oluştur
CREATE TABLE weather_logs (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    humidity INTEGER,
    pressure INTEGER,
    wind_speed DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler ekle (performans için)
CREATE INDEX idx_weather_logs_created_at ON weather_logs(created_at);
CREATE INDEX idx_weather_logs_temperature ON weather_logs(temperature);
-- -- Veritabanı tablosunu oluştur
-- CREATE TABLE IF NOT EXISTS weather_logs (
--     id SERIAL PRIMARY KEY,
--     temperature DECIMAL(5,2) NOT NULL,
--     description VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- İndeks ekle (performans için)
-- CREATE INDEX IF NOT EXISTS idx_weather_logs_created_at ON weather_logs(created_at);

-- -- Test verisi ekle (opsiyonel)
-- INSERT INTO weather_logs (temperature, description) 
-- VALUES (25.5, 'clear sky') 
-- ON CONFLICT DO NOTHING;