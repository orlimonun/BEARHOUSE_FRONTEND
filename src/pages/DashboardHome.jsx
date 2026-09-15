import { useAuth } from '../context/useAuth';

function DashboardHome() {
    const { usuario, rol } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-bear-gold mb-2">
                ¡Bienvenido, {usuario}!
            </h1>
            <p className="text-neutral-400">Rol: {rol}</p>
        </div>
    );
}

export default DashboardHome;