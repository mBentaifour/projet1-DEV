// src/auth.js
import axios from "axios";

export const getValidAccessToken = async () => {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!access && !refresh) {
    throw new Error("Pas de token, tu dois te connecter.");
  }

  try {
    // On teste l'access token en appelant une route protégée
    await axios.get("http://127.0.0.1:8000/api/files/", {
      headers: { Authorization: `Bearer ${access}` },
    });
    return access;
  } catch (error) {
    if (error.response?.status === 401 && refresh) {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh: refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);
        return newAccess;
      } catch (refreshError) {
        throw new Error("Échec du refresh token. Reconnecte-toi.");
      }
    } else {
      throw new Error("Token invalide.");
    }
  }
};
