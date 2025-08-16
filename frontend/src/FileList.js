// src/FileList.js
import React, { useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

const FileManager = ({ content, loading, error, onDeleteSuccess, onFolderClick }) => {
  const [visibleShareLink, setVisibleShareLink] = useState(null);

  const handleDelete = async (fileId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      return;
    }
    try {
      const token = await getValidAccessToken();
      await axios.delete(`${API_URL}/files/${fileId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeleteSuccess();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleShare = async (fileId) => {
    try {
      const token = await getValidAccessToken();
      const response = await axios.post(`${API_URL}/files/${fileId}/share/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sharedLink = response.data.shared_link;
      setVisibleShareLink({ id: fileId, link: sharedLink });
    } catch (err) {
      console.error("Erreur lors de la création du lien de partage :", err);
      alert("❌ Impossible de créer le lien de partage.");
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Lien copié dans le presse-papiers !");
    }).catch(err => {
      console.error("Erreur de copie :", err);
      alert("Impossible de copier le lien.");
    });
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h3>📄 Contenu du dossier</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {!loading && content.folders.length === 0 && content.files.length === 0 && <p>Ce dossier est vide.</p>}

      <ul>
        {content.folders.map((folder) => (
          <li key={`folder-${folder.id}`} className="folder-item" onClick={() => onFolderClick(folder)} style={{ cursor: 'pointer' }}>
            <div className="file-info">
              <span className="folder-icon">📁</span>
              <strong>{folder.name}</strong>
            </div>
          </li>
        ))}

        {content.files.map((file) => (
          <li key={`file-${file.id}`}>
            <div className="file-info">
              <p style={{ margin: 0 }}>
                <strong>{file.name}</strong>
              </p>
              {file.file_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img src={file.file_url} alt={file.name} width="200" style={{ display: 'block', marginTop: '5px' }} />
              ) : (
                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                  📄 Télécharger
                </a>
              )}
              {visibleShareLink && visibleShareLink.id === file.id && (
                <div className="share-link-container">
                  <input type="text" readOnly value={visibleShareLink.link} />
                  <button onClick={() => copyToClipboard(visibleShareLink.link)}>Copier</button>
                </div>
              )}
            </div>
            <div className="file-actions">
              <button onClick={() => handleShare(file.id)} className="share-button">Partager</button>
              <button onClick={() => handleDelete(file.id)} className="delete-button">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileManager;
