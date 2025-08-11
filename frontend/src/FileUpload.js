import React, { useState } from "react";
import axios from "axios";
import { getValidAccessToken } from "./auth";

const FileUpload = () => {
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

      const response = await axios.post(
        "127.0.0.1/api/files/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Fichier téléversé avec succès !");
      console.log("Réponse serveur :", response.data);
      setFile(null);
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

