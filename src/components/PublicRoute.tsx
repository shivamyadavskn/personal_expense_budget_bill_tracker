import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );

  // ⏳ Wait until auth check completes
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // 🔁 Already logged in → redirect
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Not logged in → allow access
  return <>{children}</>;
};

export default PublicRoute;
