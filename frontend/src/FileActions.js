// src/FileActions.js
import React, { useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

// La prop "onCreateFolder" est la clé. C'est la fonction qui vient de App.js pour ouvrir la modale.
const FileActions = ({ onActionSuccess, currentFolderId, onCreateFolder }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // La logique d'upload reste la même
  const handleUpload = async () => {
    if (!file) {
      alert("📂 Sélectionne un fichier avant d'envoyer !");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const token = await getValidAccessToken();
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) {
        formData.append("folder", currentFolderId);
      }
      await axios.post(`${API_URL}/files/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setFile(null);
      document.querySelector('input[type="file"]').value = "";
      onActionSuccess();
    } catch (err) {
      console.error("Erreur de téléversement :", err);
      setError("❌ Erreur de téléversement. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3>Actions</h3>
      <div className="actions-container">
        <div className="upload-section">
          <input type="file" onChange={handleFileChange} disabled={isUploading} />
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Téléversement..." : "Envoyer"}
          </button>
        </div>

        {/*
          ICI EST LE CHANGEMENT IMPORTANT :
          onClick appelle directement "onCreateFolder" qui vient des props.
          Il n'y a plus de fonction handleCreateFolder dans ce fichier.
        */}
        <button onClick={onCreateFolder} className="new-folder-button">
          📁 Nouveau Dossier
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileActions;

