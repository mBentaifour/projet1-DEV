// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import FileUpload from "./FileUpload";
import FileList from "./FileList";
import { getValidAccessToken, API_URL } from "./auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access")
  );

  // L'état des fichiers et la fonction pour les charger sont maintenant ici !
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    if (!isLoggedIn) return; // Ne rien faire si on n'est pas connecté
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const response = await axios.get(`${API_URL}/files/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Erreur lors du fetch des fichiers :", err);
      setError(err.message || "❌ Erreur lors du chargement des fichiers.");
    } finally {
      setLoading(false);
    }
  };

  // On charge les fichiers une fois au démarrage si l'utilisateur est connecté
  useEffect(() => {
    fetchFiles();
  }, [isLoggedIn]);


  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setFiles([]); // Vider la liste des fichiers à la déconnexion
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>projet1-DEV - Interface utilisateur</h1>
      {isLoggedIn ? (
        <>
          <p>✅ Connecté</p>
          <button onClick={handleLogout}>Se déconnecter</button>

          {/* On passe la fonction pour rafraîchir en prop */}
          <FileUpload onUploadSuccess={fetchFiles} />
	        <hr />

          {/* On passe la liste des fichiers et la fonction de rafraîchissement en props */}
          <FileList
            files={files}
            loading={loading}
            error={error}
            onDeleteSuccess={fetchFiles}
          />
        </>
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
