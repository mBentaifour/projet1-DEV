import React, { useEffect, useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement

  // Fonction pour charger les fichiers, on pourra la réutiliser
  const fetchFiles = async () => {
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
  
  // Premier chargement des fichiers
  useEffect(() => {
    fetchFiles();
  }, []);

  // Handler pour la suppression
  const handleDelete = async (fileId) => {
    // On demande confirmation avant de supprimer
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

      // Mettre à jour la liste des fichiers SANS recharger la page
      setFiles(files.filter((file) => file.id !== fileId));

    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError(err.message || "❌ Erreur lors de la suppression du fichier.");
    }
  };

  if (loading) {
    return <p>Chargement des fichiers...</p>;
  }

  return (
    <div>
      <h3>📄 Liste des fichiers</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <p>
              <strong>{file.name}</strong>
            </p>
            {file.file_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
              <img src={file.file_url} alt={file.name} width="200" />
            ) : (
              <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                📄 Télécharger
              </a>
            )}
            {/* BOUTON SUPPRIMER */}
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
