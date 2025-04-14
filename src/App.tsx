
import React, { useEffect, useState } from "react";
import Navigation from "./components/Navigation";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return (
      <div style={{
        backgroundColor: "#000",
        color: "#00ff00",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem"
      }}>
        ✅ App layout is loading...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#000",
      color: "#00ff00",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      ✅ Rendering Navigation component:
      <Navigation />
    </div>
  );
}
