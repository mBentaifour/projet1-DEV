// src/FileList.js
import React from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

// Récupère les props depuis App.js
const FileList = ({ files, loading, error, onDeleteSuccess }) => {

  const handleDelete = async (fileId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      return;
    }

    try {
      const token = await getValidAccessToken();
      await axios.delete(`${API_URL}/files/${fileId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Appelle la fonction du parent pour rafraîchir la liste
      onDeleteSuccess();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      // On pourrait afficher une erreur plus propre ici
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
          <li key={file.id} style={{ marginBottom: '15px' }}>
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
            <button 
              onClick={() => handleDelete(file.id)} 
              style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
