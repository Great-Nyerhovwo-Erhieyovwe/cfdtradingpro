import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";

/**
 * ProtectedRoute - Protect user dashboard routes
 * 
 * - Checks if user is logged in (token in localStorage)
 * - Redirects to /login if not authenticated
 * - Shows loading while checking authentication
 */
interface ProtectedRouteProps {
  element: React.ReactElement;
  isLoading?: boolean;
}

export function ProtectedRoute({ element, isLoading = false }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // If loading, show loading component
  if (isLoading) {
    return <Loading isLoading={true} message="Loading Dashboard..." fullScreen={true} />;
  }

  // Not authenticated - redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render the element
  return element;
}
