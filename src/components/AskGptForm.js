import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AskGptChat.css";

const AskGptForm = ({ chartId }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("access_token");
  const userMessages = messages.filter((m) => m.user === "Вы");
  const hasReachedLimit = !isAuthenticated && userMessages.length >= 2;

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const newMessage = { user: "Вы", text: question.trim() };
    const updatedMessages = [...messages, newMessage];

    if (hasReachedLimit) return;

    setMessages(updatedMessages);
    setQuestion("");
    setLoading(true);
    setIsTyping(true);

    try {
      const payload = {
        chart_id: Number(chartId),
        question: question.trim(),
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const jwt = localStorage.getItem("access_token");
      const sessionToken = localStorage.getItem("session_token");

      if (jwt && jwt !== "null") {
        headers["Authorization"] = `Bearer ${jwt}`;
      } else {
        let token = sessionToken;
        if (!token) {
          token = crypto.randomUUID();
          localStorage.setItem("session_token", token);
        }
        headers["X-Session-Token"] = token;
      }

      const response = await fetch("https://astrologywebapp-production.up.railway.app/ask-gpt", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const gptMessage = {
        user: "GPT",
        text: data.response || "GPT не дал ответа.",
      };

      setMessages((prev) => [...prev, gptMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { user: "GPT", text: "Ошибка запроса" },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="askgpt-container">
      <h4>Чат с GPT</h4>

      {messages.length > 0 && (
        <div className={`chat-messages ${hasReachedLimit ? "blurred" : ""}`}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.user === "Вы" ? "user" : "gpt"}`}>
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

      {hasReachedLimit && (
        <div className="auth-warning" style={{ marginBottom: 12 }}>
          Чтобы продолжить, войдите в аккаунт
        </div>
      )}

      {!hasReachedLimit && (
        <>
          <textarea
            rows={2}
            className="chat-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Введите вопрос..."
          />
          <button
            className="chat-send"
            onClick={sendQuestion}
            disabled={loading || (!question.trim() && !isTyping)}
          >
            {loading ? "Отправка..." : "Спросить"}
          </button>
        </>
      )}

      {hasReachedLimit && (
        <button
          className="chat-send auth-btn"
          onClick={() => navigate("/authorization")}
        >
          Войти
        </button>
      )}
    </div>
  );
};

export default AskGptForm;
