import React, { useState } from "react";
import Login from "./Login";
import FileUpload from "./FileUpload";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access")
  );

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>projet1-DEV - Interface utilisateur</h1>
      {isLoggedIn ? (
        <>
          <p>✅ Connecté</p>
          <button onClick={handleLogout}>Se déconnecter</button>
          <FileUpload />
        </>
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;

