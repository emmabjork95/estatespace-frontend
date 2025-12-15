import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { HomeLayout } from "./pages/Layouts/HomeLayout";
import { MainLayout } from "./pages/Layouts/MainLayout";
import { AuthLayout } from "./pages/Layouts/AuthLayout";
import { Signup } from "./pages/Signup";
import Login from "./pages/Login";
import { RequireAuth } from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                index: true,
                element: <Home/> 
            }
        ]
    },

      {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },

    {
        path: "/",
        element: (
        <RequireAuth>
          <MainLayout />,  
        </RequireAuth>
        ),
        children: [
          { path: "dashboard", element: <Dashboard /> },
        ]
    },

    { path: "*", element: <NotFound /> },
])