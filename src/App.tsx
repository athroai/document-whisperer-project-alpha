
import React, { useEffect, useState } from "react";
// Import the component you want to test here
// import ComponentName from "./components/ComponentName"; // Replace with actual path

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
      ✅ Rendering component below:
      {/* <ComponentName /> */}
      {/* Uncomment above line and replace ComponentName with the actual component */}
    </div>
  );
}
