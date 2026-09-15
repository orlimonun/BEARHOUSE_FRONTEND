import { useState, useEffect } from 'react';
import { listarMesas, crearMesa, actualizarMesa, eliminarMesa } from '../api/mesasApi';

function MesasPage() {
    const [mesas, setMesas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [numero, setNumero] = useState('');
    const [capacidad, setCapacidad] = useState('');
    const [estado, setEstado] = useState('LIBRE');
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            try {
                const datos = await listarMesas();
                if (!cancelado) setMesas(datos);
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar las mesas');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => setMesas(await listarMesas());

    const limpiar = () => {
        setNumero(''); setCapacidad(''); setEstado('LIBRE'); setEditandoId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const datos = {
                numero: Number(numero),
                capacidad: capacidad === '' ? null : Number(capacidad),
                estado,
            };
            if (editandoId) {
                await actualizarMesa(editandoId, datos);
            } else {
                await crearMesa(datos);
            }
            limpiar();
            await refrescar();
        } catch (err) {
            alert('No se pudo guardar. Puede que ese número de mesa ya exista.');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const handleEditar = (mesa) => {
        setEditandoId(mesa.id);
        setNumero(mesa.numero);
        setCapacidad(mesa.capacidad ?? '');
        setEstado(mesa.estado);
    };

    const handleEliminar = async (mesa) => {
        if (!window.confirm(`¿Eliminar la mesa ${mesa.numero}?`)) return;
        try {
            await eliminarMesa(mesa.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar. Puede que tenga órdenes asociadas.');
            console.error(err);
        }
    };

    const colorEstado = (est) => {
        if (est === 'OCUPADA') return 'text-bear-red';
        if (est === 'RESERVADA') return 'text-bear-gold';
        return 'text-green-400';
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    if (cargando) return <p className="text-neutral-400">Cargando mesas...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-bear-gold mb-6">Mesas</h1>

            <form onSubmit={handleSubmit}
                  className="bg-bear-dark border border-bear-gold/20 rounded-xl p-4 mb-6 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                    <label className="block text-neutral-300 mb-1 text-sm">
                        {editandoId ? 'Editar mesa' : 'N° de mesa'}
                    </label>
                    <input type="number" min="1" value={numero}
                           onChange={(e) => setNumero(e.target.value)} className={inputClass} required />
                </div>

                <div className="col-span-3">
                    <label className="block text-neutral-300 mb-1 text-sm">Capacidad</label>
                    <input type="number" min="1" value={capacidad}
                           onChange={(e) => setCapacidad(e.target.value)}
                           placeholder="4" className={inputClass} />
                </div>

                <div className="col-span-3">
                    <label className="block text-neutral-300 mb-1 text-sm">Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
                        <option value="LIBRE">Libre</option>
                        <option value="OCUPADA">Ocupada</option>
                        <option value="RESERVADA">Reservada</option>
                    </select>
                </div>

                <div className="col-span-3 flex gap-2">
                    <button type="submit" disabled={guardando}
                            className="flex-1 bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                        {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editandoId && (
                        <button type="button" onClick={limpiar}
                                className="border border-bear-gold/30 text-neutral-300 px-4 py-2 rounded-lg">
                            ✕
                        </button>
                    )}
                </div>
            </form>

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Mesa</th>
                        <th className="px-4 py-3">Capacidad</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mesas.map((mesa) => (
                        <tr key={mesa.id} className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                            <td className="px-4 py-3 font-semibold">Mesa {mesa.numero}</td>
                            <td className="px-4 py-3">{mesa.capacidad ?? '—'}</td>
                            <td className={`px-4 py-3 font-semibold ${colorEstado(mesa.estado)}`}>{mesa.estado}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={() => handleEditar(mesa)} className="text-bear-gold hover:underline mr-4">
                                    Editar
                                </button>
                                <button onClick={() => handleEliminar(mesa)} className="text-bear-red hover:underline">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {mesas.length === 0 && (
                <p className="text-neutral-400 mt-4">
                    No hay mesas todavía. (Tu hermano no las necesita aún, pero quedan listas para cuando tenga salón.)
                </p>
            )}
        </div>
    );
}

export default MesasPage;