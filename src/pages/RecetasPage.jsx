import { useState, useEffect } from 'react';
import {
    verRecetaDePlatillo,
    agregarIngredienteReceta,
    actualizarLineaReceta,
    quitarIngredienteReceta,
} from '../api/recetasApi';
import { listarPlatillos } from '../api/platillosApi';
import { listarIngredientes } from '../api/ingredientesApi';

function RecetasPage() {
    const [platillos, setPlatillos] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [platilloId, setPlatilloId] = useState('');
    const [receta, setReceta] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [cargandoReceta, setCargandoReceta] = useState(false);
    const [error, setError] = useState('');

    const [nuevoIngredienteId, setNuevoIngredienteId] = useState('');
    const [nuevaCantidad, setNuevaCantidad] = useState('');
    const [guardando, setGuardando] = useState(false);

    const [editandoId, setEditandoId] = useState(null);
    const [cantidadEditada, setCantidadEditada] = useState('');

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            try {
                const [datosPla, datosIng] = await Promise.all([
                    listarPlatillos(),
                    listarIngredientes(),
                ]);
                if (!cancelado) {
                    setPlatillos(datosPla);
                    setIngredientes(datosIng);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar los datos');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const cargarReceta = async (id) => {
        if (!id) {
            setReceta([]);
            return;
        }
        setCargandoReceta(true);
        try {
            const datos = await verRecetaDePlatillo(id);
            setReceta(datos);
        } catch (err) {
            alert('No se pudo cargar la receta');
            console.error(err);
        } finally {
            setCargandoReceta(false);
        }
    };

    const handleSeleccionPlatillo = async (e) => {
        const id = e.target.value;
        setPlatilloId(id);
        setEditandoId(null);
        await cargarReceta(id);
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!platilloId || !nuevoIngredienteId || !nuevaCantidad) return;
        setGuardando(true);
        try {
            await agregarIngredienteReceta({
                platilloId: Number(platilloId),
                ingredienteId: Number(nuevoIngredienteId),
                cantidad: Number(nuevaCantidad),
            });
            setNuevoIngredienteId('');
            setNuevaCantidad('');
            await cargarReceta(platilloId);
        } catch (err) {
            alert('No se pudo agregar. Puede que ese ingrediente ya esté en la receta.');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const handleGuardarEdicion = async (linea) => {
        try {
            await actualizarLineaReceta(linea.id, {
                platilloId: Number(platilloId),
                ingredienteId: linea.ingredienteId,
                cantidad: Number(cantidadEditada),
            });
            setEditandoId(null);
            await cargarReceta(platilloId);
        } catch (err) {
            alert('No se pudo actualizar la cantidad');
            console.error(err);
        }
    };

    const handleQuitar = async (linea) => {
        if (!window.confirm(`¿Quitar "${linea.ingredienteNombre}" de la receta?`)) return;
        try {
            await quitarIngredienteReceta(linea.id);
            await cargarReceta(platilloId);
        } catch (err) {
            alert('No se pudo quitar el ingrediente');
            console.error(err);
        }
    };

    const platilloSeleccionado = platillos.find((p) => String(p.id) === String(platilloId));

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    if (cargando) return <p className="text-neutral-400">Cargando...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-bear-gold mb-6">Recetas</h1>

            <div className="bg-bear-dark border border-bear-gold/20 rounded-xl p-4 mb-6">
                <label className="block text-neutral-300 mb-1 text-sm">Platillo</label>
                <select value={platilloId} onChange={handleSeleccionPlatillo} className={inputClass}>
                    <option value="">Seleccioná un platillo para ver o editar su receta</option>
                    {platillos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                </select>
            </div>

            {platilloId && (
                <>
                    <form
                        onSubmit={handleAgregar}
                        className="bg-bear-dark border border-bear-gold/20 rounded-xl p-4 mb-6 grid grid-cols-12 gap-3 items-end"
                    >
                        <div className="col-span-7">
                            <label className="block text-neutral-300 mb-1 text-sm">Agregar ingrediente</label>
                            <select value={nuevoIngredienteId}
                                    onChange={(e) => setNuevoIngredienteId(e.target.value)}
                                    className={inputClass} required>
                                <option value="">Seleccioná...</option>
                                {ingredientes.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.nombre} ({ing.unidadMedida})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-3">
                            <label className="block text-neutral-300 mb-1 text-sm">Cantidad</label>
                            <input type="number" step="0.001" min="0.001"
                                   value={nuevaCantidad}
                                   onChange={(e) => setNuevaCantidad(e.target.value)}
                                   className={inputClass} required />
                        </div>

                        <div className="col-span-2">
                            <button type="submit" disabled={guardando}
                                    className="w-full bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                                {guardando ? '...' : 'Agregar'}
                            </button>
                        </div>
                    </form>

                    <h2 className="text-xl font-semibold text-bear-gold mb-3">
                        Receta de {platilloSeleccionado?.nombre}
                    </h2>

                    {cargandoReceta ? (
                        <p className="text-neutral-400">Cargando receta...</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                                <table className="w-full text-left">
                                    <thead>
                                    <tr className="bg-bear-dark text-bear-gold text-sm">
                                        <th className="px-4 py-3">Ingrediente</th>
                                        <th className="px-4 py-3">Cantidad</th>
                                        <th className="px-4 py-3">Unidad</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {receta.map((linea) => (
                                        <tr key={linea.id}
                                            className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                                            <td className="px-4 py-3">{linea.ingredienteNombre}</td>
                                            <td className="px-4 py-3">
                                                {editandoId === linea.id ? (
                                                    <input type="number" step="0.001" min="0.001"
                                                           value={cantidadEditada}
                                                           onChange={(e) => setCantidadEditada(e.target.value)}
                                                           className="w-32 px-2 py-1 rounded bg-black/40 text-white border border-bear-gold/40 outline-none" />
                                                ) : (
                                                    linea.cantidad
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{linea.unidadMedida}</td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                {editandoId === linea.id ? (
                                                    <>
                                                        <button onClick={() => handleGuardarEdicion(linea)}
                                                                className="text-bear-gold hover:underline mr-4">
                                                            Guardar
                                                        </button>
                                                        <button onClick={() => setEditandoId(null)}
                                                                className="text-neutral-400 hover:underline">
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditandoId(linea.id);
                                                                setCantidadEditada(linea.cantidad);
                                                            }}
                                                            className="text-bear-gold hover:underline mr-4"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button onClick={() => handleQuitar(linea)}
                                                                className="text-bear-red hover:underline">
                                                            Quitar
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {receta.length === 0 && (
                                <p className="text-neutral-400 mt-4">
                                    Este platillo todavía no tiene ingredientes en su receta.
                                </p>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default RecetasPage;