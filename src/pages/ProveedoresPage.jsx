import { useState, useEffect } from 'react';
import {
    listarProveedores, crearProveedor, actualizarProveedor, eliminarProveedor,
} from '../api/proveedoresApi';
import ProveedorForm from '../components/ProveedorForm';

function ProveedoresPage() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            setError('');
            try {
                const datos = await listarProveedores();
                if (!cancelado) setProveedores(datos);
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar los proveedores');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => setProveedores(await listarProveedores());

    const handleGuardar = async (datos) => {
        if (editando) {
            await actualizarProveedor(editando.id, datos);
        } else {
            await crearProveedor(datos);
        }
        await refrescar();
        setMostrarForm(false);
        setEditando(null);
    };

    const handleEliminar = async (prov) => {
        if (!window.confirm(`¿Eliminar el proveedor "${prov.nombre}"?`)) return;
        try {
            await eliminarProveedor(prov.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar. Puede que tenga compras asociadas.');
            console.error(err);
        }
    };

    if (cargando) return <p className="text-neutral-400">Cargando proveedores...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Proveedores</h1>
                {!mostrarForm && (
                    <button onClick={() => { setEditando(null); setMostrarForm(true); }}
                            className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition">
                        + Nuevo proveedor
                    </button>
                )}
            </div>

            {mostrarForm && (
                <ProveedorForm
                    key={editando?.id ?? 'nuevo'}
                    proveedor={editando}
                    onGuardar={handleGuardar}
                    onCancelar={() => { setMostrarForm(false); setEditando(null); }}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Contacto</th>
                        <th className="px-4 py-3">Teléfono</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {proveedores.map((prov) => (
                        <tr key={prov.id} className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                            <td className="px-4 py-3">{prov.nombre}</td>
                            <td className="px-4 py-3">{prov.contacto || '—'}</td>
                            <td className="px-4 py-3">{prov.telefono || '—'}</td>
                            <td className="px-4 py-3">{prov.correo || '—'}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={() => { setEditando(prov); setMostrarForm(true); }}
                                        className="text-bear-gold hover:underline mr-4">
                                    Editar
                                </button>
                                <button onClick={() => handleEliminar(prov)} className="text-bear-red hover:underline">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {proveedores.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay proveedores todavía.</p>
            )}
        </div>
    );
}

export default ProveedoresPage;