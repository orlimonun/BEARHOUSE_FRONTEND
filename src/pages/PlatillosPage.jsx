import { useState, useEffect } from 'react';
import {
    listarPlatillos, crearPlatillo, actualizarPlatillo, eliminarPlatillo,
} from '../api/platillosApi';
import { listarCategoriasPlatillo } from '../api/categoriasPlatilloApi';
import PlatilloForm from '../components/PlatilloForm';

function PlatillosPage() {
    const [platillos, setPlatillos] = useState([]);
    const [categorias, setCategorias] = useState([]);
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
                const [datosPla, datosCat] = await Promise.all([
                    listarPlatillos(),
                    listarCategoriasPlatillo(),
                ]);
                if (!cancelado) {
                    setPlatillos(datosPla);
                    setCategorias(datosCat);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar los platillos');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => setPlatillos(await listarPlatillos());

    const handleGuardar = async (datos) => {
        if (editando) {
            await actualizarPlatillo(editando.id, datos);
        } else {
            await crearPlatillo(datos);
        }
        await refrescar();
        setMostrarForm(false);
        setEditando(null);
    };

    const handleEliminar = async (pla) => {
        if (!window.confirm(`¿Eliminar "${pla.nombre}"?`)) return;
        try {
            await eliminarPlatillo(pla.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar. Puede que tenga recetas u órdenes asociadas.');
            console.error(err);
        }
    };

    const formatearMonto = (n) =>
        `₡${Number(n ?? 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    if (cargando) return <p className="text-neutral-400">Cargando platillos...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Menú</h1>
                {!mostrarForm && (
                    <button onClick={() => { setEditando(null); setMostrarForm(true); }}
                            className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition">
                        + Nuevo platillo
                    </button>
                )}
            </div>

            {mostrarForm && (
                <PlatilloForm
                    key={editando?.id ?? 'nuevo'}
                    platillo={editando}
                    categorias={categorias}
                    onGuardar={handleGuardar}
                    onCancelar={() => { setMostrarForm(false); setEditando(null); }}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Precio</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3">Disponible</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {platillos.map((pla) => (
                        <tr key={pla.id} className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                            <td className="px-4 py-3">
                                <div className="font-medium">{pla.nombre}</div>
                                {pla.descripcion && (
                                    <div className="text-neutral-400 text-xs mt-1">{pla.descripcion}</div>
                                )}
                            </td>
                            <td className="px-4 py-3 font-semibold">{formatearMonto(pla.precio)}</td>
                            <td className="px-4 py-3">{pla.categoriaNombre || '—'}</td>
                            <td className="px-4 py-3">
                                {pla.disponible ? (
                                    <span className="text-green-400">Sí</span>
                                ) : (
                                    <span className="text-bear-red">No</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={() => { setEditando(pla); setMostrarForm(true); }}
                                        className="text-bear-gold hover:underline mr-4">
                                    Editar
                                </button>
                                <button onClick={() => handleEliminar(pla)} className="text-bear-red hover:underline">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {platillos.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay platillos todavía.</p>
            )}
        </div>
    );
}

export default PlatillosPage;