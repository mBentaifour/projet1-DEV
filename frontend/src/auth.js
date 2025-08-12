// src/auth.js
import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";
// Sauvegarde des tokens
export const saveTokens = (access, refresh) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

// Récupération des tokens
export const getTokens = () => ({
  access: localStorage.getItem("access"),
  refresh: localStorage.getItem("refresh"),
});

// Vérifie si un token est expiré
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Décodage JWT
    return Date.now() > payload.exp * 1000;
  } catch {
    return true;
  }
};

// Récupère un access token valide
export const getValidAccessToken = async () => {
  let { access, refresh } = getTokens();

  // Si access token encore valide → on le retourne
  if (access && !isTokenExpired(access)) {
    return access;
  }

  // Si access expiré mais refresh valide → on rafraîchit
  if (refresh && !isTokenExpired(refresh)) {
    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refresh,
      });
      const newAccess = response.data.access;
      saveTokens(newAccess, refresh);
      return newAccess;
    } catch (error) {
      console.error("❌ Erreur refresh token :", error);
      logout();
      throw new Error("Session expirée, reconnectez-vous.");
    }
  }

  // Si tout expiré → déconnexion
  logout();
  throw new Error("Session expirée, reconnectez-vous.");
};

// Déconnexion
export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
};

