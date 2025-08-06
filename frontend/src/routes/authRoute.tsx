import { useStore } from "@/store/store";
import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/routePaths";

const AuthRoute = () => {
  const { accessToken, user } = useStore();

  if (!accessToken && !user) return <Outlet />;

  // Redirect based on user role
  if (user?.role === "admin") {
    return <Navigate to={PROTECTED_ROUTES.ADMIN_DASHBOARD} replace />;
  } else {
    return <Navigate to={PROTECTED_ROUTES.USER_DASHBOARD} replace />;
  }
};

export default AuthRoute;
