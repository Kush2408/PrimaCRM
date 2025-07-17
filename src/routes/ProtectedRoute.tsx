import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import Cookies from 'js-cookie';

type ProtectedRouteProps = {
  children: ReactElement;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = Cookies.get('access_token'); 
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
