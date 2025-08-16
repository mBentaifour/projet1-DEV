// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Login from "./Login";
import FileUpload from "./FileUpload";
import FileManager from "./FileList";
import { getValidAccessToken, API_URL } from "./auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [content, setContent] = useState({ folders: [], files: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // NOUVEAU : On gère l'historique de navigation
  const [folderHistory, setFolderHistory] = useState([{ id: null, name: "Accueil" }]);
  const currentFolder = folderHistory[folderHistory.length - 1];

  const fetchContent = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const token = await getValidAccessToken();
      let response;

      if (searchTerm) {
        const searchUrl = `${API_URL}/files/search/?search=${searchTerm}`;
        response = await axios.get(searchUrl, { headers: { Authorization: `Bearer ${token}` } });
        setContent({ folders: [], files: response.data });
      } else {
        const folderId = currentFolder.id;
        const folderUrl = folderId ? `${API_URL}/files/folders/content/${folderId}/` : `${API_URL}/files/folders/content/`;
        response = await axios.get(folderUrl, { headers: { Authorization: `Bearer ${token}` } });
        setContent(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      setError(err.message || "❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, currentFolder, searchTerm]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // NOUVELLE FONCTION : pour naviguer dans un dossier
  const handleFolderClick = (folder) => {
    setSearchTerm(""); // On vide la recherche quand on navigue
    setFolderHistory([...folderHistory, folder]);
  };
  
  // NOUVELLE FONCTION : pour naviguer dans le fil d'Ariane
  const handleBreadcrumbClick = (index) => {
    setFolderHistory(folderHistory.slice(0, index + 1));
  };
  
  const handleLogout = () => { /* ... (pas de changement ici) ... */ };

  return (
    <div className="container">
      <h1>projet1-DEV - Interface utilisateur</h1>
      {isLoggedIn ? (
        <>
          <p>✅ Connecté</p>
          <button onClick={handleLogout} className="logout-button">Se déconnecter</button>
          
          <FileUpload currentFolderId={currentFolder.id} onUploadSuccess={fetchContent} />
	        <hr />

          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher dans tous les fichiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* NOUVEAU : Le fil d'Ariane pour la navigation */}
          <div className="breadcrumbs">
            {folderHistory.map((folder, index) => (
              <span key={folder.id || 'root'}>
                <button className="breadcrumb-button" onClick={() => handleBreadcrumbClick(index)}>
                  {folder.name}
                </button>
                {index < folderHistory.length - 1 && ' / '}
              </span>
            ))}
          </div>

          <FileManager 
            content={content} 
            loading={loading} 
            error={error} 
            onDeleteSuccess={fetchContent}
            onFolderClick={handleFolderClick} // On passe la fonction de navigation
          />
        </>
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
