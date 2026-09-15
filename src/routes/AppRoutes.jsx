import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardLayout from '../pages/DashboardLayout';
import DashboardHome from '../pages/DashboardHome';
import InventarioPage from '../pages/InventarioPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute';
import CategoriasIngredientePage from '../pages/CategoriasIngredientePage';
import ProveedoresPage from '../pages/ProveedoresPage';
import ComprasPage from '../pages/ComprasPage';
import CategoriasPlatilloPage from '../pages/CategoriasPlatilloPage';
import PlatillosPage from '../pages/PlatillosPage';
import RecetasPage from '../pages/RecetasPage';
import OrdenesPage from '../pages/OrdenesPage';
import MesasPage from '../pages/MesasPage';
import EmpleadosPage from '../pages/EmpleadosPage';
import ReportesPage from '../pages/ReportesPage';


function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="inventario" element={<InventarioPage />} />
                <Route path="categorias-ingrediente" element={<CategoriasIngredientePage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="compras" element={<ComprasPage />} />
                <Route path="platillos" element={<PlatillosPage />} />
                <Route path="categorias-platillo" element={<CategoriasPlatilloPage />} />
                <Route path="recetas" element={<RecetasPage />} />
                <Route path="ordenes" element={<OrdenesPage />} />
                <Route path="mesas" element={<MesasPage />} />
                <Route path="empleados" element={<EmpleadosPage />} />
                <Route path="reportes" element={<ReportesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppRoutes;