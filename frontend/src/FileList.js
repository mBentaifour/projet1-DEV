// src/FileList.js
import React from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

const FileList = ({ files, loading, error, onDeleteSuccess }) => {

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
      prompt(
        "Voici votre lien de partage (valide 24h). Copiez-le :",
        sharedLink
      );

    } catch (err) {
      console.error("Erreur lors de la création du lien de partage :", err);
      alert("❌ Impossible de créer le lien de partage.");
    }
  };

  if (loading) {
    return <p>Chargement des fichiers...</p>;
  }

  return (
    <div>
      <h3>📄 Liste des fichiers</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {files.length === 0 && !loading && <p>Aucun fichier trouvé.</p>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <div>
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
            </div>

            <div className="file-actions">
              <button 
                onClick={() => handleShare(file.id)}
                className="share-button"
              >
                Partager
              </button>
              <button 
                onClick={() => handleDelete(file.id)} 
                className="delete-button"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
