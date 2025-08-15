// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Login from "./Login";
import FileUpload from "./FileUpload";
import FileList from "./FileList";
import { getValidAccessToken, API_URL } from "./auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access")
  );
  
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const url = searchTerm ? `${API_URL}/files/?search=${searchTerm}` : `${API_URL}/files/`;
      const response = await axios.get(url, {
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
  }, [isLoggedIn, searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setFiles([]);
  };

  return (
    <div className="container">
      <h1>projet1-DEV - Interface utilisateur</h1>
      {isLoggedIn ? (
        <>
          <p>✅ Connecté</p>
          <button onClick={handleLogout} className="logout-button">Se déconnecter</button>
          
          <FileUpload onUploadSuccess={fetchFiles} />
	        <hr />

          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher un fichier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
