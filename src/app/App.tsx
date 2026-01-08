import { RouterProvider } from "react-router-dom";
import "../shared/styles/App.css";
import "../shared/pages/Home.css";
import { router } from "./Router";
import { AuthProvider } from "./providers/AuthContext";
import "../shared/components/ui/Global.css";

function App() {

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