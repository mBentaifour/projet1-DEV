// src/FileUpload.js
import React, { useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

// On récupère la fonction onUploadSuccess depuis les props
const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("📂 Sélectionne un fichier avant d'envoyer !");
      return;
    }
    try {
      const token = await getValidAccessToken();
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${API_URL}/files/upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Fichier téléversé avec succès !");
      setFile(null); // Vider l'input
      document.querySelector('input[type="file"]').value = ""; // Vider l'input visuellement

      // On appelle la fonction du parent pour rafraîchir la liste !
      onUploadSuccess();

    } catch (error) {
      console.error("Erreur de téléversement :", error);
      alert(error.message || "❌ Erreur de téléversement.");
    }
  };

  return (
    <div>
      <h3>📁 Téléverser un fichier</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Envoyer</button>
    </div>
  );
};

export default FileUpload;
