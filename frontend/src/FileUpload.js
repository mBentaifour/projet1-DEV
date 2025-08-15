// src/FileUpload.js
import React, { useState } from "react";
import axios from "axios";
import { getValidAccessToken, API_URL } from "./auth";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

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

      setFile(null);
      document.querySelector('input[type="file"]').value = "";
      onUploadSuccess();

    } catch (err) {
      console.error("Erreur de téléversement :", err);
      setError("❌ Erreur de téléversement. Veuillez réessayer."); 
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3>📁 Téléverser un fichier</h3>
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} disabled={isUploading} />
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Téléversement en cours..." : "Envoyer"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
