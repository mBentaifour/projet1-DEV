// src/FileList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth"; // <-- IMPORT IMPORTANT

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = await getValidAccessToken();
        // 👇 UTILISATION DE API_URL
        const response = await axios.get(`${API_URL}/files/`, {
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <p><strong>{file.name}</strong></p>
            {file.file_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
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
