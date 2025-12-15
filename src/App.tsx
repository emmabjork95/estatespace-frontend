import { RouterProvider } from "react-router-dom";
import "./App.css";
import "./styles/Home.css";
import { router } from "./Router";
import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
  </AuthProvider>
  );
}


export default App;
