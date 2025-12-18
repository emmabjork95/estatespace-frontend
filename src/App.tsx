import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import "./styles/Home.css";
import { router } from "./Router";
import { AuthProvider } from "./context/AuthContext";


function App() {
useEffect(() => {
const base = import.meta.env.VITE_API_URL.replace(/\/$/, "");
fetch(`${base}/health`)
    .then((res) => res.json())
    .then((data) => console.log("Backend health:", data))
    .catch((err) => console.error("Backend health error:", err));
}, []);

  return (
    <AuthProvider>
      <div
        className="app-shell">
      
      <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
