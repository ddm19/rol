import Loading from 'components/Loading/Loading';
import { useAuth } from 'hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}


const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/" replace />;

  const roles = (user.app_metadata as any)?.roles as string[] | undefined;
  const role = (user.app_metadata as any)?.role as string | undefined;
  const isAdmin = role === 'admin' || (Array.isArray(roles) && roles.includes('admin'));
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminRoute;

