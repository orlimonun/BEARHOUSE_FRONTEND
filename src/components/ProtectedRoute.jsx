import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute({ children }) {
    const { estaAutenticado } = useAuth();

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;