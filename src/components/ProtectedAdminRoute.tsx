import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";
import { api } from "../api/client";

/**
 * ProtectedAdminRoute - Protect admin dashboard routes
 * 
 * - Checks if admin is logged in via backend cookie
 * - Verifies user role is 'admin'
 * - Redirects to /admin/login if not authenticated as admin
 * - Shows loading while checking authentication
 */
interface ProtectedAdminRouteProps {
  element: React.ReactElement;
  isLoading?: boolean;
}

export function ProtectedAdminRoute({ element, isLoading = false }: ProtectedAdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        setIsAdmin(data?.role === "admin");
      } catch {
        setIsAdmin(false);
      } finally {
        setVerificationLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading || verificationLoading) {
    return <Loading isLoading={true} message="Verifying Admin Access..." fullScreen={true} />;
  }

  if (!isAdmin) {
    try { localStorage.removeItem('user'); } catch {}
    return <Navigate to="/admin/login" replace />;
  }

  return element;
}
