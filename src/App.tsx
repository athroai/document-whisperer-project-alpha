
import React, { useEffect, useState } from "react";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("Client component mounted");
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div style={{ background: "#111", color: "#ccc", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        Initialising...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#111",
      color: "#0f0",
      fontSize: "30px",
      padding: "3rem",
      fontFamily: "monospace"
    }}>
      ✅ App layout is loading... <br />
      {/* Add your real app components below one at a time to test rendering */}
      {/* <Header /> */}
      {/* <MainDashboard /> */}
      {/* <Sidebar /> */}
    </div>
  );
}
