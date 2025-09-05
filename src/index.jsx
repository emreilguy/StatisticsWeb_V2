
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import "./custom.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import DetailPage from "./pages/DetailsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/register.jsx";

import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { getSession } from "./utils/auth.js";


const session = getSession();
const authority = session?.authority;
const isAdmin = authority === "Super Admin" || authority === "Admin";
const isUser = authority === "User";


const getHomePath = () => {
  if (isAdmin) return "/dashboard";

  const centerId = session?.centerId || session?.profile?.centerId;
  if (isUser && centerId) return `/detail/${centerId}`;

  return "/dashboard";
};


function LoginRoute() {
  if (session) return <Navigate to={getHomePath()} replace />;
  return <LoginPage />;
}

const router = createBrowserRouter([

  {
    path: "/login",
    element: <LoginRoute />,
  },

  {
    element: <AdminRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/dashboard/register",
        element: <RegisterPage />
      },
    ],
  },


  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/detail/:centerId",
        element: <DetailPage />
      },
    ],
  },


  {
    path: "*",
    element: session ? (
      <Navigate to={getHomePath()} replace />
    ) : (
      <Navigate to="/login" replace />
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
