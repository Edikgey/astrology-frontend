import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Joi from "joi";
import "./TryFreePage.css";

const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i);
const months = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? "0" + i : "" + i));
const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

// 🔄 ОБНОВЛЁННАЯ ФУНКЦИЯ
const calculateNatalChart = async (formData, token = null) => {
  try {
    const monthIndex = months.indexOf(formData.month) + 1;

    const payload = {
      year: parseInt(formData.year),
      month: monthIndex,
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      lon: formData.longitude ? parseFloat(formData.longitude) : null,
      lat: formData.latitude ? parseFloat(formData.latitude) : null,
      city: formData.birthPlace,
      region: formData.region || "",
      country: formData.country || "",
      julian_date: formData.julianDate,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      let sessionToken = localStorage.getItem("session_token");
      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        localStorage.setItem("session_token", sessionToken);
      }
      payload.session_token = sessionToken;
    }

    console.log("📦 Payload:", payload);

    const response = await fetch("https://astrologywebapp-production.up.railway.app/natal-chart", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📦 Полный ответ от сервера:", data);
    if (!response.ok) throw new Error(JSON.stringify(data));

    console.log("✅ Натальная карта получена:", data);
    console.log("🎯 chart_id в ответе:", data.chart_id);
    localStorage.setItem("natalChart", JSON.stringify(data));
    localStorage.setItem("chart_id", data.chart_id);
    return data;
  } catch (error) {
    console.error("❌ Ошибка при расчёте натальной карты:", error);
    return null;
  }
};

const TryFreePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    year: "2000",
    month: "Январь",
    day: "1",
    hour: "00",
    minute: "00",
    birthPlace: "",
    latitude: "",
    longitude: "",
    region: "",
    country: "",
    julianDate: "",
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "birthPlace" && value.length > 2) {
      fetchCitySuggestions(value);
    }
  };

  const fetchCitySuggestions = async (city) => {
    const API_KEY = "2634e51d1eeb43968d131969b0e2360c";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${API_KEY}&language=ru`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const cityList = data.results.map((item) => ({
          name: item.formatted,
          lat: item.geometry.lat,
          lng: item.geometry.lng,
          country: item.components.country || "",
          region: item.components.state || item.components.region || "",
        }));
        setSuggestions(cityList);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Ошибка получения городов:", error);
    }
  };

  const selectCity = (city) => {
    setFormData((prevData) => ({
      ...prevData,
      birthPlace: city.name,
      latitude: city.lat,
      longitude: city.lng,
      country: city.country || "",
      region: city.region || "",
    }));
    setSuggestions([]);
  };

  const convertToJulian = (year, monthName, day, hour, minute) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const y = parseInt(year);
    const m = months.indexOf(monthName) + 1;
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    const a = Math.floor((14 - m) / 12);
    const y_adj = y + 4800 - a;
    const m_adj = m + 12 * a - 3;

    const JDN = d + Math.floor((153 * m_adj + 2) / 5) + 365 * y_adj
      + Math.floor(y_adj / 4) - Math.floor(y_adj / 100) + Math.floor(y_adj / 400) - 32045;

    const JD = JDN + (h - 12) / 24 + min / 1440;

    return JD.toFixed(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      year: formData.year || "2000",
      month: formData.month || "Январь",
      day: formData.day || "1",
      hour: formData.hour || "00",
      minute: formData.minute || "00",
    };

    const monthIndex = months.indexOf(updatedFormData.month) + 1;
    const selectedDate = `${String(updatedFormData.year).padStart(4, "0")}-${String(monthIndex).padStart(2, "0")}-${String(updatedFormData.day).padStart(2, "0")}`;
    const selectedTime = `${String(updatedFormData.hour).padStart(2, "0")}:${String(updatedFormData.minute).padStart(2, "0")}`;
    const julianDate = convertToJulian(updatedFormData.year, updatedFormData.month, updatedFormData.day, updatedFormData.hour, updatedFormData.minute);

    const finalData = {
      ...updatedFormData,
      birthDate: selectedDate,
      birthTime: selectedTime,
      julianDate,
      region: formData.region,
      country: formData.country,
    };

    localStorage.setItem("tempUserData", JSON.stringify(finalData));

    const result = await calculateNatalChart(finalData, localStorage.getItem("access_token"));

    if (!result) {
      alert("Произошла ошибка при расчёте натальной карты");
      return;
    }

    navigate("/natal-chart-result");
  };

  return (
    <div className="tryfree-container">
      <div className="tryfree-form">
        <h2>Создать свою натальную карту</h2>
        <form onSubmit={handleSubmit}>
          <label>Дата рождения:</label>
          <div className="date-selects">
            <select name="year" value={formData.year} onChange={handleChange}>{years.map(y => <option key={y}>{y}</option>)}</select>
            <select name="month" value={formData.month} onChange={handleChange}>{months.map(m => <option key={m}>{m}</option>)}</select>
            <select name="day" value={formData.day} onChange={handleChange}>{days.map(d => <option key={d}>{d}</option>)}</select>
          </div>

          <label>Время рождения:</label>
          <div className="time-selects">
            <select name="hour" value={formData.hour} onChange={handleChange}>{hours.map(h => <option key={h}>{h}</option>)}</select>
            <select name="minute" value={formData.minute} onChange={handleChange}>{minutes.map(m => <option key={m}>{m}</option>)}</select>
          </div>

          <label>Место рождения:</label>
          <input
            type="text"
            name="birthPlace"
            placeholder="Введите город"
            value={formData.birthPlace}
            onChange={handleChange}
          />
          {errors.birthPlace && <p className="error">{errors.birthPlace}</p>}

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((city, index) => (
                <li key={index} onClick={() => selectCity(city)}>
                  {city.name}
                </li>
              ))}
            </ul>
          )}

          <button type="submit">Рассчитать карту</button>
        </form>
      </div>
    </div>
  );
};

export default TryFreePage;
