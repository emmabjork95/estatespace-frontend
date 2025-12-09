import { createBrowserRouter } from "react-router";
import { Layout } from "./pages/Layouts";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <NotFound />,
        children: [
            {
                path: "/",
                element: <Home/> 
            },
        ]
    }
])