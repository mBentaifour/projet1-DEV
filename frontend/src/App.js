// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Login from "./Login";
import FileActions from "./FileActions";
import FileManager from "./FileList";
import Modal from './Modal';
import { getValidAccessToken, API_URL } from "./auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [content, setContent] = useState({ folders: [], files: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderHistory, setFolderHistory] = useState([{ id: null, name: "Accueil" }]);
  const currentFolder = folderHistory[folderHistory.length - 1];
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchContent = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
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

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setContent({ folders: [], files: [] });
  };

  const handleFolderClick = (folder) => {
    setSearchTerm("");
    setFolderHistory([...folderHistory, folder]);
  };
  
  const handleBreadcrumbClick = (index) => {
    setFolderHistory(folderHistory.slice(0, index + 1));
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName || newFolderName.trim() === "") return;
    try {
      const token = await getValidAccessToken();
      await axios.post(`${API_URL}/files/folders/create/`, 
        { name: newFolderName, parent: currentFolder.id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateFolderModalOpen(false);
      setNewFolderName("");
      fetchContent();
    } catch (err) {
      console.error("Erreur lors de la création du dossier :", err);
      alert("❌ Impossible de créer le dossier.");
    }
  };

  return (
    <div className="container">
      <h1>projet1-DEV - Interface utilisateur</h1>
      {isLoggedIn ? (
        <>
          <p>✅ Connecté</p>
          <button onClick={handleLogout} className="logout-button">Se déconnecter</button>
          
          <FileActions 
            currentFolderId={currentFolder.id} 
            onActionSuccess={fetchContent}
            onCreateFolder={() => setCreateFolderModalOpen(true)}
          />
	        <hr />

          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher dans tous les fichiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
            onFolderClick={handleFolderClick}
          />
        </>
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}

      <Modal isOpen={isCreateFolderModalOpen} onClose={() => setCreateFolderModalOpen(false)}>
        <form onSubmit={handleCreateFolder}>
          <h3>Nouveau Dossier</h3>
          <input
            type="text"
            className="modal-input"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="modal-button-cancel" onClick={() => setCreateFolderModalOpen(false)}>Annuler</button>
            <button type="submit" className="modal-button-confirm">Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
