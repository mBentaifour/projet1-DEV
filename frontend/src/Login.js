// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { saveTokens } from "./auth";

// Exemple pour Login.js
import { API_URL } from "./auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("📨 Envoi du POST avec", username, password); // juste un log
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      // ⚠️ Adapter ici selon ta réponse backend
      saveTokens(response.data.access, response.data.refresh);

      window.location.href = "/";
    } catch (err) {
      console.error("Erreur login :", err);
      setError("Identifiants invalides.");
    }
  };

  return (
    <div>
      <h2>🔑 Connexion</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;

