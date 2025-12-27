import { createBrowserRouter } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import { HomeLayout } from "./pages/Layouts/HomeLayout";
import { MainLayout } from "./pages/Layouts/MainLayout";
import { AuthLayout } from "./pages/Layouts/AuthLayout";
import { Signup } from "./features/auth/pages/Signup";
import Login from "./features/auth/pages/Login";
import { RequireAuth } from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import CreateSpaces from "./features/spaces/pages/CreateSpaces";
import SpaceView from "./features/spaces/pages/SpaceView";
import CreateItem from "./features/items/pages/CreateItem";
import ItemDetail from "./features/items/pages/ItemDetail";
import EditItem from "./features/items/pages/EditItem";
import Home from "./pages/Home";
import EditSpace from "./features/spaces/pages/EditSpace";
import { Profile } from "./features/auth/pages/Profile";
import { AcceptInvite } from "./features/invites/pages/AcceptInvites";
import SpaceMembers from "./features/invites/pages/SpaceMembers";

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
      { path: "auth/invite/:token", element: <AcceptInvite /> },
      
    ],
  },

    {
        path: "/",
        element: (
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
        ),
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "spaces/new", element: <CreateSpaces /> },
          { path: "spaces/:spacesID", element: <SpaceView /> },
          { path: "spaces/:spacesID/items/new", element: <CreateItem /> },
          { path: "items/:itemsID", element: <ItemDetail /> },
          { path: "items/:itemsID/edit", element: <EditItem /> },
          { path: "spaces/:spacesID/edit", element: <EditSpace /> },
          { path: "profile", element: <Profile /> },
          { path: "spaces/:spacesID/members", element: <SpaceMembers /> },




        ]
    },

    { path: "*", element: <NotFound /> },
])