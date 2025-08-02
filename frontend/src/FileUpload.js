import React, { useState } from "react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Aucun fichier sélectionné.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/files/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("✅ Fichier téléversé avec succès !");
        console.log(data);
      } else {
        const error = await response.json();
        setMessage(`❌ Erreur : ${error.detail || "upload échoué"}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("❌ Erreur lors de l’envoi.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>🗂️ Téléverser un fichier</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Envoyer</button>
      <p>{message}</p>
    </form>
  );
}

export default FileUpload;
