import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";

const AdminRoute = () => {
  const { isAdmin } = useAdmin();

  // If user is not admin, redirect to user dashboard
  if (!isAdmin) {
    return <Navigate to={PROTECTED_ROUTES.USER_DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default AdminRoute; 