import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isSessionActive } from "@/services/session";

/** Keeps nested routes behind a lightweight mock session gate. */
export function ProtectedRoute() {
  const location = useLocation();

  if (!isSessionActive()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
