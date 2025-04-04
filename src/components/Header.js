import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AskGptForm from "./AskGptForm";
import "./Header.css";

const Header = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [gptError, setGptError] = useState(null);
  const navigate = useNavigate();
  const chartId = localStorage.getItem("chart_id");

  const handleGptClick = () => {
    if (!user) {
      setGptError("Чтобы использовать GPT, необходимо войти в аккаунт.");
      return;
    }
    if (!chartId) {
      setGptError("Натальная карта не найдена. Сначала рассчитайте карту.");
      return;
    }

    setGptError(null);
    setShowChat((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Главная</Link>
        <Link to="/pricing">Цены</Link>
        <Link to="/reviews">Отзывы</Link>
        <Link to="/reports">Отчеты</Link>
        <Link to="/tools">Инструменты</Link>
      </div>

      <div className="nav-right">
        <button className="gpt-button" onClick={handleGptClick}>
          🧠 Спросить GPT
        </button>

        {gptError && <p className="gpt-error-message">{gptError}</p>}

        {showChat && chartId && (
          <div className="gpt-popup">
            <AskGptForm chartId={parseInt(chartId)} />
          </div>
        )}

        {user ? (
          <div className="user-menu">
            <div
              className="avatar-container"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User Avatar"
                  className="user-avatar"
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              {menuOpen && (
                <div
                  className="dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link to="/my-charts">My Charts</Link>
                  <Link to="/my-reports">My Reports</Link>
                  <Link to="/my-calendar">My Calendar</Link>
                  <Link to="/daily-horoscope">Daily Horoscope</Link>
                  <Link to="/settings">User Settings</Link>
                  <hr />
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="logout-btn"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate("/authorization")}>
            Войти / Регистрация
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;