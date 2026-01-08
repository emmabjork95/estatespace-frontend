import { createBrowserRouter } from "react-router-dom";

import { RequireAuth } from "./routes/RequireAuth";

import { AuthLayout } from "./layouts/AuthLayout";
import { HomeLayout } from "./layouts/HomeLayout";
import { MainLayout } from "./layouts/MainLayout";

import { AcceptInvite } from "../features/invites/pages/AcceptInvites";
import SpaceMembers from "../features/invites/pages/SpaceMembers";

import { Profile } from "../features/auth/pages/Profile";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import Login from "../features/auth/pages/Login";
import ResetPassword from "../features/auth/pages/ResetPassword";
import { Signup } from "../features/auth/pages/Signup";

import CreateItem from "../features/items/pages/CreateItem";
import EditItem from "../features/items/pages/EditItem";
import ItemDetail from "../features/items/pages/ItemDetail";

import CreateSpaces from "../features/spaces/pages/CreateSpaces";
import EditSpace from "../features/spaces/pages/EditSpace";
import SpaceView from "../features/spaces/pages/SpaceView";

import Dashboard from "../shared/pages/Dashboard";
import Home from "../shared/pages/Home";
import NotFound from "../shared/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },

      { path: "invite/:token", element: <AcceptInvite /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
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
      { path: "profile", element: <Profile /> },

      { path: "spaces/new", element: <CreateSpaces /> },
      { path: "spaces/:spacesID", element: <SpaceView /> },
      { path: "spaces/:spacesID/edit", element: <EditSpace /> },
      { path: "spaces/:spacesID/members", element: <SpaceMembers /> },

      { path: "spaces/:spacesID/items/new", element: <CreateItem /> },
      { path: "items/:itemsID", element: <ItemDetail /> },
      { path: "items/:itemsID/edit", element: <EditItem /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);