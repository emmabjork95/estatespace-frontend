import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { HomeLayout } from "./pages/Layouts/HomeLayout";
import { MainLayout } from "./pages/Layouts/MainLayout";
import { AuthLayout } from "./pages/Layouts/AuthLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                path: "/",
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
        element: <MainLayout />,  
        children: [
        ]
    },

    { path: "*", element: <NotFound /> },
])