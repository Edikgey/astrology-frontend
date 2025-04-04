import React, { createContext, useState, useEffect, useContext } from "react";
import {
  requestRegister,
  verifyCode,
  login,
  getMe,
} from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  useEffect(() => {
    if (token) {
      getMe(token)
        .then((data) => setUser(data))
        .catch(() => logout());
    }
  }, [token]);

  const loginUser = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    const userData = await getMe(data.access_token);
    setUser(userData);
  };

  const registerEmail = async (email, password) => {
    return await requestRegister(email, password);
  };

  const verifyRegistration = async (code, email, password) => {
    const data = await verifyCode(code, email, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    const userData = await getMe(data.access_token);
    setUser(userData);
  };

  const fetchCurrentUser = async (token) => {
    const data = await getMe(token);
    setUser(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginUser,
        logout,
        registerEmail,
        verifyRegistration,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
