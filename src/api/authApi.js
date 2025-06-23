const BASE_URL = "https://astrologywebapp-production.up.railway.app";

// Вспомогательная функция получения session_token
function getSessionToken() {
  let token = localStorage.getItem("session_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("session_token", token);
  }
  return token;
}

/**
 * Запрашивает отправку кода подтверждения на email и пароль
 */
export async function requestRegister(email, password) {
  console.log("📤 Отправляем на /auth/request-register:", { email, password });

  const response = await fetch(`${BASE_URL}/auth/request-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data.detail || "Ошибка регистрации";
    throw new Error(errorMessage);
  }

  console.log("✅ Код отправлен:", data);
  return data;
}

/**
 * Подтверждает код и завершает регистрацию (возвращает токен)
 */
export async function verifyCode(code, email, password) {
  const sessionToken = getSessionToken();

  const response = await fetch(`${BASE_URL}/auth/verify-code?code=${code}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data.detail || "Ошибка регистрации";
    throw new Error(errorMessage);
  }

  // Удаляем session_token, сохраняем access_token
  localStorage.removeItem("session_token");
  localStorage.setItem("access_token", data.access_token);

  console.log("✅ Верификация прошла:", data);
  return data;
}

/**
 * Логин по email и паролю
 */
export async function login(email, password) {
  const sessionToken = getSessionToken();

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data.detail || "Ошибка входа";
    throw new Error(errorMessage);
  }

  // Удаляем session_token, сохраняем access_token
  localStorage.removeItem("session_token");
  localStorage.setItem("access_token", data.access_token);

  console.log("✅ Вход выполнен:", data);
  return data;
}

/**
 * Получение текущего пользователя по access_token
 */
export async function getMe(token) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("❌ Ошибка при получении пользователя:", data);
    throw new Error(data.detail || "Ошибка получения пользователя");
  }

  console.log("✅ Пользователь:", data);
  return {
    id: data.id,
    email: data.email,
    photoURL: data.photoURL || null,
  };
}
