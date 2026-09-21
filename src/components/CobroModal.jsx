import { useState, useEffect } from 'react';
import { listarPagosDeOrden, registrarPago } from '../api/pagosApi';

function CobroModal({ orden, onCerrar, onPagado }) {
    const [seleccion, setSeleccion] = useState({});
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [pagos, setPagos] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const pendientes = orden.detalles.filter((d) => d.cantidadPendiente > 0);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargandoPagos(true);
            try {
                const datos = await listarPagosDeOrden(orden.id);
                if (!cancelado) setPagos(datos);
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelado) setCargandoPagos(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, [orden.id]);

    const cambiarCantidad = (detalleId, valor, max) => {
        let n = Number(valor);
        if (isNaN(n) || n < 0) n = 0;
        if (n > max) n = max;
        setSeleccion((prev) => ({ ...prev, [detalleId]: n }));
    };

    const seleccionarTodo = () => {
        const todo = {};
        pendientes.forEach((d) => { todo[d.id] = d.cantidadPendiente; });
        setSeleccion(todo);
    };

    const limpiarSeleccion = () => setSeleccion({});

    const itemsSeleccionados = pendientes
        .filter((d) => (seleccion[d.id] || 0) > 0)
        .map((d) => ({ detalleOrdenId: d.id, cantidad: seleccion[d.id] }));

    const subtotalSeleccion = pendientes.reduce((acc, d) => {
        return acc + Number(d.precioUnitario) * (seleccion[d.id] || 0);
    }, 0);

    // Si esta selección cubre todo lo pendiente, se cobra también el transporte
    const cubreTodo =
        pendientes.length > 0 &&
        pendientes.every((d) => (seleccion[d.id] || 0) === d.cantidadPendiente);
    const transporte = cubreTodo ? Number(orden.transporte || 0) : 0;
    const totalACobrar = subtotalSeleccion + transporte;

    const handleCobrar = async () => {
        if (itemsSeleccionados.length === 0) {
            setError('Seleccioná al menos un ítem para cobrar');
            return;
        }
        setError('');
        setGuardando(true);
        try {
            await registrarPago(orden.id, { metodoPago, items: itemsSeleccionados });
            await onPagado();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo registrar el pago');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const formatearMonto = (n) =>
        `₡${Number(n ?? 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const inputClass =
        'px-2 py-1 rounded bg-black/40 text-white outline-none border border-bear-gold/30 focus:border-bear-gold transition';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-bear-dark border border-bear-gold/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-bear-gold">Cobrar orden #{orden.id}</h2>
                        <p className="text-neutral-400 text-sm">
                            Saldo pendiente: <span className="text-white font-semibold">
                {formatearMonto(orden.saldoPendiente)}
              </span>
                        </p>
                    </div>
                    <button onClick={onCerrar} className="text-neutral-400 hover:text-bear-gold text-xl">✕</button>
                </div>

                {pendientes.length === 0 ? (
                    <p className="text-green-400 mb-4">Esta orden ya está totalmente pagada.</p>
                ) : (
                    <>
                        <div className="flex gap-3 mb-3">
                            <button onClick={seleccionarTodo}
                                    className="text-bear-gold hover:underline text-sm">
                                Seleccionar todo
                            </button>
                            <button onClick={limpiarSeleccion}
                                    className="text-neutral-400 hover:underline text-sm">
                                Limpiar
                            </button>
                        </div>

                        <div className="rounded-xl border border-bear-gold/20 overflow-hidden mb-4">
                            <table className="w-full text-left text-sm">
                                <thead>
                                <tr className="bg-black/40 text-bear-gold">
                                    <th className="px-4 py-2">Platillo</th>
                                    <th className="px-4 py-2">Pendientes</th>
                                    <th className="px-4 py-2">Precio</th>
                                    <th className="px-4 py-2">A cobrar</th>
                                    <th className="px-4 py-2">Subtotal</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendientes.map((d) => (
                                    <tr key={d.id} className="border-t border-bear-gold/10 text-neutral-200">
                                        <td className="px-4 py-2">{d.platilloNombre}</td>
                                        <td className="px-4 py-2">{d.cantidadPendiente}</td>
                                        <td className="px-4 py-2">{formatearMonto(d.precioUnitario)}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max={d.cantidadPendiente}
                                                value={seleccion[d.id] ?? ''}
                                                placeholder="0"
                                                onChange={(e) => cambiarCantidad(d.id, e.target.value, d.cantidadPendiente)}
                                                className={`${inputClass} w-20`}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatearMonto(Number(d.precioUnitario) * (seleccion[d.id] || 0))}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-end gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-neutral-300 mb-1 text-sm">Método de pago</label>
                                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                                        className={`${inputClass} w-full`}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="SINPE">SINPE</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div className="text-right">
                                {transporte > 0 && (
                                    <p className="text-neutral-400 text-sm">
                                        + Transporte: {formatearMonto(transporte)}
                                    </p>
                                )}
                                <p className="text-neutral-300 text-sm">Total a cobrar</p>
                                <p className="text-3xl font-bold text-bear-gold">{formatearMonto(totalACobrar)}</p>
                            </div>
                        </div>

                        {error && <p className="text-bear-red text-sm mb-3">{error}</p>}

                        <div className="flex gap-3 mb-6">
                            <button onClick={handleCobrar} disabled={guardando}
                                    className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50">
                                {guardando ? 'Cobrando...' : 'Registrar cobro'}
                            </button>
                            <button onClick={onCerrar}
                                    className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition">
                                Cerrar
                            </button>
                        </div>
                    </>
                )}

                <div className="border-t border-bear-gold/20 pt-4">
                    <h3 className="text-bear-gold font-semibold mb-2">Pagos registrados</h3>
                    {cargandoPagos ? (
                        <p className="text-neutral-400 text-sm">Cargando...</p>
                    ) : pagos.length === 0 ? (
                        <p className="text-neutral-400 text-sm">Todavía no hay pagos en esta orden.</p>
                    ) : (
                        <div className="space-y-2">
                            {pagos.map((p) => (
                                <div key={p.id} className="bg-black/30 rounded-lg px-4 py-2 text-sm">
                                    <div className="flex justify-between">
                    <span className="text-neutral-200">
                      <span className="text-bear-gold font-semibold">{p.metodoPago}</span>
                        {p.empleadoNombre && <span className="text-neutral-400"> · {p.empleadoNombre}</span>}
                    </span>
                                        <span className="font-semibold text-white">{formatearMonto(p.monto)}</span>
                                    </div>
                                    <div className="text-neutral-400 text-xs mt-1">
                                        {p.detalles.map((d) => `${d.cantidad}× ${d.platilloNombre}`).join(', ')}
                                        {Number(p.transporteCobrado) > 0 && ` + transporte ${formatearMonto(p.transporteCobrado)}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CobroModal;