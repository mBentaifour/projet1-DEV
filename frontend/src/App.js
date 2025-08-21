// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Login from "./Login";
import FileActions from "./FileActions";
import FileManager from "./FileList";
import Modal from './Modal'; // <-- Importer notre nouvelle modale
import { getValidAccessToken, API_URL } from "./auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [content, setContent] = useState({ folders: [], files: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderHistory, setFolderHistory] = useState([{ id: null, name: "Accueil" }]);
  const currentFolder = folderHistory[folderHistory.length - 1];

  // NOUVEAU : États pour la modale de création de dossier
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
 // <-- VOICI L'AJOUT POUR LE TITRE
  useEffect(() => {
    document.title = "Tay4 Votre Gestionnaire de Fichiers";
  }, []); // Le tableau vide [] assure que cela ne s'exécute qu'une seule fois

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

  const handleLogout = () => {
  // 1. On supprime les tokens JWT du stockage local
  localStorage.removeItem("access");
  localStorage.removeItem("refresh"); // Important de supprimer les deux !

  // 2. On met à jour l'état pour dire que l'utilisateur n'est plus connecté
  setIsLoggedIn(false);

  // 3. On vide le contenu affiché pour éviter d'afficher les anciens fichiers
  setContent({ folders: [], files: [] });

  console.log("Utilisateur déconnecté.");
};
  const handleFolderClick = (folder) => {
    setSearchTerm("");
    setFolderHistory([...folderHistory, folder]);
  };
  const handleBreadcrumbClick = (index) => {
    setFolderHistory(folderHistory.slice(0, index + 1));
  };

  // NOUVELLE FONCTION : pour créer un dossier via la modale
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
         {/* 👇 AJOUTE TON TITRE ICI 👇 */}
      <h4>Tay4-Manage</h4>
      <h3>Votre Gestionnaire de Fichiers</h3>
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

      {/* La modale pour créer un dossier */}
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
