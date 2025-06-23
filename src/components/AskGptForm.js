import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AskGptChat.css";

const AskGptForm = ({ chartId }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  const sessionToken =
    localStorage.getItem("session_token") ||
    (() => {
      const token = crypto.randomUUID();
      localStorage.setItem("session_token", token);
      return token;
    })();

  // 🔓 Лимит отключён
  const hasReachedLimit = false;

  // Загрузка истории чата и данных карты
  useEffect(() => {
    const fetchInitialData = async () => {
      const headers = {};
      const jwt = localStorage.getItem("access_token");
      if (jwt && jwt !== "null") {
        headers["Authorization"] = `Bearer ${jwt}`;
      } else {
        headers["X-Session-Token"] = sessionToken;
      }

      try {
        const chatRes = await fetch(
          `https://astrologywebapp-production.up.railway.app/gpt-messages?chart_id=${chartId}`,
          { method: "GET", headers }
        );
        const chatData = await chatRes.json();
        const formattedMessages = chatData.map((msg) => ({
          user: msg.role === "user" ? "Вы" : "GPT",
          text: msg.content,
        }));
        setMessages(formattedMessages);

        const chartRes = await fetch(
          `https://astrologywebapp-production.up.railway.app/natal-chart/${chartId}`,
          { method: "GET", headers }
        );
        const chartJson = await chartRes.json();
        setChartData(chartJson);
      } catch (error) {
        console.error("❌ Ошибка загрузки данных:", error);
      }
    };

    if (chartId) {
      fetchInitialData();
    }
  }, [chartId, sessionToken]);

  const sendQuestion = async (q = question) => {
    if (!q.trim()) return;

    const newMessage = { user: "Вы", text: q.trim() };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setQuestion("");
    setLoading(true);
    setIsTyping(true);

    try {
      const payload = {
        chart_id: Number(chartId),
        question: q.trim(),
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const jwt = localStorage.getItem("access_token");
      if (jwt && jwt !== "null") {
        headers["Authorization"] = `Bearer ${jwt}`;
      } else {
        headers["X-Session-Token"] = sessionToken;
      }

      const response = await fetch(
        "https://astrologywebapp-production.up.railway.app/ask-gpt",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      const gptMessage = {
        user: "GPT",
        text: data.response || "GPT не дал ответа.",
      };

      setMessages((prev) => [...prev, gptMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { user: "GPT", text: "Ошибка запроса" }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="askgpt-container">
      <h4>Чат с GPT</h4>

      {chartData && (
        <div className="chart-info">
          <p>
            <strong>Карта ID:</strong> {chartData.chart_id}
          </p>
          <p>
            <strong>Градусы Солнца:</strong>{" "}
            {chartData.bodies_for_circle?.["☉"]?.roundedDegree}
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.user === "Вы" ? "user" : "gpt"}`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}

          {isTyping && (
            <div className="message gpt typing-indicator standalone">
              <em>GPT печатает...</em>
            </div>
          )}
        </div>
      )}

      {/* ✅ Готовые вопросы */}
      <div className="predefined-questions" style={{ marginBottom: 12 }}>
        <p>
          <strong>Попробуйте один из готовых вопросов:</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            "Какой я тип личности?",
            "Какие у меня сильные стороны по натальной карте?",
            "На что обратить внимание в отношениях?",
          ].map((preset, i) => (
            <button
              key={i}
              onClick={() => sendQuestion(preset)}
              className="preset-btn"
              disabled={loading}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={2}
        className="chat-input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Введите вопрос..."
      />
      <button
        className="chat-send"
        onClick={() => sendQuestion()}
        disabled={loading || (!question.trim() && !isTyping)}
      >
        {loading ? "Отправка..." : "Спросить"}
      </button>
    </div>
  );
};

export default AskGptForm;
