
import React, { useEffect, useState } from "react";
import CitationDemo from "./components/athro/CitationDemo";

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
    <div className="bg-gray-100 min-h-screen">
      <CitationDemo />
    </div>
  );
}
