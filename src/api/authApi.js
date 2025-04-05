const BASE_URL = "https://astrologywebapp-production.up.railway.app";

/**
 * Запрашивает отправку кода подтверждения на email и пароль
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { message: string }
 */
export async function requestRegister(email, password) {
  console.log("📤 Отправляем на /auth/request-register:", { email, password });

  const response = await fetch(`${BASE_URL}/auth/request-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log("📥 Ответ от сервера:", data);

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
 * @param {string} code
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { access_token: string, token_type: string }
 */
export async function verifyCode(code, email, password) {
  const response = await fetch(`${BASE_URL}/auth/verify-code?code=${code}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  console.log("✅ Верификация прошла:", data);
  return data;
}

/**
 * Логин по email и паролю (возвращает токен)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { access_token: string, token_type: string }
 */
export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  console.log("✅ Вход выполнен:", data);
  return data;
}

/**
 * Получение текущего пользователя по токену
 * @param {string} token
 * @returns {Promise<object>} { id, email, photoURL (или null) }
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
    photoURL: data.photoURL || null, // 🔁 гарантировано будет либо ссылка, либо null
  };
}

