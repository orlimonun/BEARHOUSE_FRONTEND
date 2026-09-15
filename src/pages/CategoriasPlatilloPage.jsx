import { useState, useEffect } from 'react';
import {
    listarCategoriasPlatillo,
    crearCategoriaPlatillo,
    actualizarCategoriaPlatillo,
    eliminarCategoriaPlatillo,
} from '../api/categoriasPlatilloApi';

function CategoriasPlatilloPage() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [nombre, setNombre] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            setError('');
            try {
                const datos = await listarCategoriasPlatillo();
                if (!cancelado) setCategorias(datos);
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar las categorías');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => setCategorias(await listarCategoriasPlatillo());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setGuardando(true);
        try {
            if (editandoId) {
                await actualizarCategoriaPlatillo(editandoId, { nombre });
            } else {
                await crearCategoriaPlatillo({ nombre });
            }
            setNombre('');
            setEditandoId(null);
            await refrescar();
        } catch (err) {
            alert('No se pudo guardar la categoría');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const handleEditar = (cat) => {
        setEditandoId(cat.id);
        setNombre(cat.nombre);
    };

    const handleCancelar = () => {
        setEditandoId(null);
        setNombre('');
    };

    const handleEliminar = async (cat) => {
        if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
        try {
            await eliminarCategoriaPlatillo(cat.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar. Puede que tenga platillos asociados.');
            console.error(err);
        }
    };

    if (cargando) return <p className="text-neutral-400">Cargando categorías...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-bear-gold mb-6">Categorías de platillo</h1>

            <form
                onSubmit={handleSubmit}
                className="bg-bear-dark border border-bear-gold/20 rounded-xl p-4 mb-6 flex gap-3 items-end"
            >
                <div className="flex-1">
                    <label className="block text-neutral-300 mb-1 text-sm">
                        {editandoId ? 'Editar categoría' : 'Nueva categoría'}
                    </label>
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Hamburguesas, Acompañamientos, Bebidas..."
                        className="w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50"
                >
                    {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                </button>
                {editandoId && (
                    <button
                        type="button"
                        onClick={handleCancelar}
                        className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                )}
            </form>

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categorias.map((cat) => (
                        <tr key={cat.id} className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                            <td className="px-4 py-3">{cat.nombre}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={() => handleEditar(cat)} className="text-bear-gold hover:underline mr-4">
                                    Editar
                                </button>
                                <button onClick={() => handleEliminar(cat)} className="text-bear-red hover:underline">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {categorias.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay categorías todavía. Creá la primera arriba.</p>
            )}
        </div>
    );
}

export default CategoriasPlatilloPage;