import { useState, useEffect } from 'react';
import {
    listarIngredientes,
    crearIngrediente,
    actualizarIngrediente,
    eliminarIngrediente,
} from '../api/ingredientesApi';
import { listarCategoriasIngrediente } from '../api/categoriasIngredienteApi';
import IngredienteForm from '../components/IngredienteForm';

function InventarioPage() {
    const [ingredientes, setIngredientes] = useState([]);
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
                const [datosIng, datosCat] = await Promise.all([
                    listarIngredientes(),
                    listarCategoriasIngrediente(),
                ]);
                if (!cancelado) {
                    setIngredientes(datosIng);
                    setCategorias(datosCat);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudo cargar el inventario');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }

        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => {
        const datos = await listarIngredientes();
        setIngredientes(datos);
    };

    const handleGuardar = async (datos) => {
        if (editando) {
            await actualizarIngrediente(editando.id, datos);
        } else {
            await crearIngrediente(datos);
        }
        await refrescar();
        setMostrarForm(false);
        setEditando(null);
    };

    const handleEditar = (ing) => {
        setEditando(ing);
        setMostrarForm(true);
    };

    const handleNuevo = () => {
        setEditando(null);
        setMostrarForm(true);
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setEditando(null);
    };

    const handleEliminar = async (ing) => {
        const confirmado = window.confirm(`¿Eliminar "${ing.nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmado) return;
        try {
            await eliminarIngrediente(ing.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar el ingrediente');
            console.error(err);
        }
    };

    if (cargando) {
        return <p className="text-neutral-400">Cargando inventario...</p>;
    }

    if (error) {
        return <p className="text-bear-red">{error}</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Inventario</h1>
                {!mostrarForm && (
                    <button
                        onClick={handleNuevo}
                        className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition"
                    >
                        + Nuevo ingrediente
                    </button>
                )}
            </div>

            {mostrarForm && (
                <IngredienteForm
                    key={editando?.id ?? 'nuevo'}
                    ingrediente={editando}
                    categorias={categorias}
                    onGuardar={handleGuardar}
                    onCancelar={handleCancelar}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Unidad</th>
                        <th className="px-4 py-3">Stock actual</th>
                        <th className="px-4 py-3">Stock mínimo</th>
                        <th className="px-4 py-3">Costo unitario</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ingredientes.map((ing) => {
                        const bajoStock = ing.stockActual <= ing.stockMinimo;
                        return (
                            <tr
                                key={ing.id}
                                className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50"
                            >
                                <td className="px-4 py-3">{ing.nombre}</td>
                                <td className="px-4 py-3">{ing.unidadMedida}</td>
                                <td className={`px-4 py-3 ${bajoStock ? 'text-bear-red font-semibold' : ''}`}>
                                    {ing.stockActual}
                                </td>
                                <td className="px-4 py-3">{ing.stockMinimo}</td>
                                <td className="px-4 py-3">₡{ing.costoUnitario}</td>
                                <td className="px-4 py-3">{ing.categoriaNombre || '—'}</td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => handleEditar(ing)}
                                        className="text-bear-gold hover:underline mr-4"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(ing)}
                                        className="text-bear-red hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {ingredientes.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay ingredientes cargados todavía.</p>
            )}
        </div>
    );
}

export default InventarioPage;