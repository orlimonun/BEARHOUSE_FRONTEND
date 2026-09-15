import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const menuPorRol = {
    admin: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Inventario', path: '/dashboard/inventario' },
        { label: 'Categorías', path: '/dashboard/categorias-ingrediente' },
        { label: 'Proveedores', path: '/dashboard/proveedores' },
        { label: 'Compras', path: '/dashboard/compras' },
        { label: 'Menú', path: '/dashboard/platillos' },
        { label: 'Cat. de platillo', path: '/dashboard/categorias-platillo' },
        { label: 'Recetas', path: '/dashboard/recetas' },
        { label: 'Órdenes', path: '/dashboard/ordenes' },
        { label: 'Mesas', path: '/dashboard/mesas' },
        { label: 'Empleados', path: '/dashboard/empleados' },
        { label: 'Reportes', path: '/dashboard/reportes' },
    ],
    bodeguero: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Inventario', path: '/dashboard/inventario' },
        { label: 'Categorías', path: '/dashboard/categorias-ingrediente' },
        { label: 'Proveedores', path: '/dashboard/proveedores' },
        { label: 'Compras', path: '/dashboard/compras' },
    ],
    mesero: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Órdenes', path: '/dashboard/ordenes' },
        { label: 'Mesas', path: '/dashboard/mesas' },
    ],
    cocina: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Recetas', path: '/dashboard/recetas' },
        { label: 'Órdenes', path: '/dashboard/ordenes' },
    ],

};

function DashboardLayout() {
    const { usuario, rol, logout } = useAuth();
    const navigate = useNavigate();

    const items = menuPorRol[rol] || [];



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-bear-black">
            <aside className="w-56 bg-bear-dark border-r border-bear-gold/20 p-4 flex flex-col">
                <h2 className="text-bear-gold font-bold text-xl mb-6">BEAR HOUSE</h2>
                <nav className="flex-1 space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="block text-neutral-300 hover:text-bear-gold px-3 py-2 rounded-lg hover:bg-black/30 transition"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-bear-gold/20 pt-4">
                    <p className="text-neutral-400 text-sm mb-2">{usuario} · {rol}</p>
                    <button
                        onClick={handleLogout}
                        className="text-bear-red text-sm hover:underline"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;