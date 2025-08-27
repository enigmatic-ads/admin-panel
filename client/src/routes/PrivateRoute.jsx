import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem("token");

  if (!userId) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

export default PrivateRoute;