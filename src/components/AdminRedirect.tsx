import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";
import { api } from "../api/client";

/**
 * AdminRedirect - Redirect /admin to /admin/dashboard
 * 
 * - If admin is logged in: redirects to /admin/dashboard
 * - If admin is NOT logged in: redirects to /admin/login
 */
export function AdminRedirect() {
  const [status, setStatus] = useState<'loading' | 'admin' | 'redirect'>('loading');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (data?.role === 'admin') {
          setStatus('admin');
          return;
        }
      } catch {
        // fall through to redirect
      }
      setStatus('redirect');
    };

    checkAdmin();
  }, []);

  if (status === 'loading') {
    return <Loading isLoading={true} message="Checking admin access..." fullScreen={true} />;
  }

  return status === 'admin' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}
