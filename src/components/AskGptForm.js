// 📁 src/components/AskGptChat.js
import React, { useState } from "react";
import "./AskGptChat.css";

const AskGptChat = ({ chartId }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) {
      console.warn("❌ Вопрос пустой, запрос не отправляется");
      return;
    }
  
    if (!chartId) {
      console.error("❌ chartId не передан");
      setAnswer("Ошибка: Натальная карта не найдена");
      return;
    }
  
    console.log("📤 Отправка вопроса:", question);
    console.log("📌 chart_id:", chartId);
  



    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("❌ Токен не найден в localStorage");
        setAnswer("Вы не авторизованы.");
        setLoading(false);
        return;
      }

      const response = await fetch("https://astrologywebapp-production.up.railway.app/ask-gpt", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chart_id: chartId, question }),
      });

      const data = await response.json();

      console.log("✅ Ответ от GPT:", data);

      if (!response.ok) {
        console.error("❌ Ошибка от GPT:", data);
        setAnswer("Ошибка: " + (data.detail || "неизвестная ошибка"));
      } else {
        setAnswer(data.interpretation || "Нет ответа от GPT.");
      }
    } catch (e) {
      console.error("❌ Ошибка при fetch:", e);
      setAnswer("Произошла ошибка при обращении к GPT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="askgpt-container">
      <h4>Чат с GPT</h4>
      <textarea
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Введите вопрос..."
      />
      <button onClick={sendQuestion} disabled={loading}>
        {loading ? "Отправка..." : "Спросить"}
      </button>
      {answer && <div className="askgpt-answer">{answer}</div>}
    </div>
  );
};

export default AskGptChat;
