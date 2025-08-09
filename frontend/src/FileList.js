import React, { useEffect, useState } from "react";
import axios from "axios";
import { getValidAccessToken } from "./auth";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = await getValidAccessToken();
        const response = await axios.get("http://127.0.0.1:8000/api/files/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFiles(response.data);
      } catch (err) {
        console.error("Erreur lors du fetch des fichiers :", err);
        setError(err.message || "❌ Erreur lors du chargement des fichiers.");
      }
    };
    fetchFiles();
  }, []);

  return (
    <div>
      <h3>📄 Liste des fichiers</h3>
      {error && <p>{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <p><strong>{file.name}</strong></p>
            {/* Correction ici : ajout du ? pour la vérification */}
            {file.file_url?.match(/\.(jpeg|jpg|png|gif|webp|png)$/i) ? (
              <img src={file.file_url} alt={file.name} width="200" />
            ) : (
              <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                📄 Télécharger
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
