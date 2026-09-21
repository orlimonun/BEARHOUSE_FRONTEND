import { useState, useEffect } from 'react';
import { listarOrdenes, crearOrden, cancelarOrden } from '../api/ordenesApi';
import { listarPlatillos } from '../api/platillosApi';
import { listarMesas } from '../api/mesasApi';
import OrdenForm from '../components/OrdenForm';
import CobroModal from '../components/CobroModal.jsx';

function OrdenesPage() {
    const [ordenes, setOrdenes] = useState([]);
    const [platillos, setPlatillos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [expandida, setExpandida] = useState(null);
    const [cobrando, setCobrando] = useState(null);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            setError('');
            try {
                const [datosOrd, datosPla, datosMes] = await Promise.all([
                    listarOrdenes(),
                    listarPlatillos(),
                    listarMesas(),
                ]);
                if (!cancelado) {
                    setOrdenes(datosOrd);
                    setPlatillos(datosPla);
                    setMesas(datosMes);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar las órdenes');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => {
        const datos = await listarOrdenes();
        setOrdenes(datos);
        return datos;
    };

    const handleGuardar = async (datos) => {
        await crearOrden(datos);
        await refrescar();
        setMostrarForm(false);
    };

    const handleCancelar = async (orden) => {
        if (!window.confirm(
            `¿Cancelar la orden #${orden.id}? Los ingredientes volverán al inventario.`
        )) return;
        try {
            await cancelarOrden(orden.id);
            await refrescar();
        } catch (err) {
            alert(err.response?.data?.message || 'No se pudo cancelar la orden');
            console.error(err);
        }
    };

    // Tras cobrar: refresca la lista y actualiza el modal con la orden al día
    const handlePagado = async () => {
        const datos = await refrescar();
        const actualizada = datos.find((o) => o.id === cobrando.id);
        if (actualizada && actualizada.saldoPendiente > 0) {
            setCobrando(actualizada);
        } else {
            setCobrando(null);
        }
    };

    const formatearMonto = (n) =>
        `₡${Number(n ?? 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const formatearFecha = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('es-CR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        });
    };

    const colorEstado = (estado) => {
        if (estado === 'PAGADA') return 'text-green-400';
        if (estado === 'CANCELADA') return 'text-bear-red';
        if (estado === 'PARCIALMENTE_PAGADA') return 'text-amber-400';
        return 'text-bear-gold';
    };

    const etiquetaEstado = (estado) => {
        if (estado === 'PARCIALMENTE_PAGADA') return 'PARCIAL';
        return estado;
    };

    const etiquetaTipo = (tipo) => {
        if (tipo === 'PARA_LLEVAR') return 'Para llevar';
        if (tipo === 'EXPRESS') return 'Express';
        return 'Local';
    };

    const sePuedeCobrar = (orden) =>
        orden.estado === 'ABIERTA' || orden.estado === 'PARCIALMENTE_PAGADA';

    if (cargando) return <p className="text-neutral-400">Cargando órdenes...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Órdenes</h1>
                {!mostrarForm && (
                    <button onClick={() => setMostrarForm(true)}
                            className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition">
                        + Nueva orden
                    </button>
                )}
            </div>

            {mostrarForm && (
                <OrdenForm
                    platillos={platillos}
                    mesas={mesas}
                    onGuardar={handleGuardar}
                    onCancelar={() => setMostrarForm(false)}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Saldo</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ordenes.map((orden) => (
                        <>
                            <tr key={orden.id}
                                className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                                <td className="px-4 py-3 font-semibold text-bear-gold">#{orden.id}</td>
                                <td className="px-4 py-3">{formatearFecha(orden.fecha)}</td>
                                <td className="px-4 py-3">
                                    {etiquetaTipo(orden.tipo)}
                                    {orden.mesaNumero && (
                                        <span className="text-neutral-400 text-xs ml-1">(Mesa {orden.mesaNumero})</span>
                                    )}
                                </td>
                                <td className={`px-4 py-3 font-semibold ${colorEstado(orden.estado)}`}>
                                    {etiquetaEstado(orden.estado)}
                                </td>
                                <td className="px-4 py-3 font-semibold">{formatearMonto(orden.total)}</td>
                                <td className="px-4 py-3">
                                    {Number(orden.saldoPendiente) > 0 ? (
                                        <span className="text-amber-400 font-semibold">
                        {formatearMonto(orden.saldoPendiente)}
                      </span>
                                    ) : (
                                        <span className="text-neutral-500">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => setExpandida(expandida === orden.id ? null : orden.id)}
                                        className="text-neutral-400 hover:text-bear-gold hover:underline mr-4"
                                    >
                                        {expandida === orden.id ? 'Ocultar' : 'Ver'}
                                    </button>
                                    {sePuedeCobrar(orden) && (
                                        <button onClick={() => setCobrando(orden)}
                                                className="text-green-400 hover:underline mr-4">
                                            Cobrar
                                        </button>
                                    )}
                                    {orden.estado === 'ABIERTA' && (
                                        <button onClick={() => handleCancelar(orden)}
                                                className="text-bear-red hover:underline">
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>

                            {expandida === orden.id && (
                                <tr key={`${orden.id}-detalle`} className="bg-black/30">
                                    <td colSpan={7} className="px-8 py-4">
                                        <table className="w-full text-sm mb-4">
                                            <thead>
                                            <tr className="text-bear-gold/70">
                                                <th className="text-left py-2">Platillo</th>
                                                <th className="text-left py-2">Cantidad</th>
                                                <th className="text-left py-2">Pagados</th>
                                                <th className="text-left py-2">Precio unit.</th>
                                                <th className="text-left py-2">Subtotal</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {orden.detalles?.map((d) => (
                                                <tr key={d.id} className="text-neutral-300">
                                                    <td className="py-1">{d.platilloNombre}</td>
                                                    <td className="py-1">{d.cantidad}</td>
                                                    <td className="py-1">
                                                        {d.cantidadPagada === d.cantidad ? (
                                                            <span className="text-green-400">{d.cantidadPagada} / {d.cantidad}</span>
                                                        ) : (
                                                            <span className="text-amber-400">{d.cantidadPagada} / {d.cantidad}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-1">{formatearMonto(d.precioUnitario)}</td>
                                                    <td className="py-1">{formatearMonto(d.subtotal)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>

                                        <div className="text-sm text-neutral-400 space-y-1">
                                            <div>Subtotal: {formatearMonto(orden.subtotal)}</div>
                                            {Number(orden.transporte) > 0 && (
                                                <div>
                                                    Transporte{orden.kilometros ? ` (${orden.kilometros} km)` : ''}:{' '}
                                                    {formatearMonto(orden.transporte)}
                                                </div>
                                            )}
                                            <div>Pagado: {formatearMonto(orden.montoPagado)}</div>
                                            {Number(orden.saldoPendiente) > 0 && (
                                                <div className="text-amber-400">
                                                    Pendiente: {formatearMonto(orden.saldoPendiente)}
                                                </div>
                                            )}
                                            {orden.pagosPorMetodo?.length > 0 && (
                                                <div>
                                                    Cobrado por método:{' '}
                                                    {orden.pagosPorMetodo
                                                        .map((p) => `${p.metodoPago} ${formatearMonto(p.monto)}`)
                                                        .join(' · ')}
                                                </div>
                                            )}
                                            {orden.observaciones && <div>Observaciones: {orden.observaciones}</div>}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    </tbody>
                </table>
            </div>

            {ordenes.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay órdenes registradas todavía.</p>
            )}

            {cobrando && (
                <CobroModal
                    orden={cobrando}
                    onCerrar={() => setCobrando(null)}
                    onPagado={handlePagado}
                />
            )}
        </div>
    );
}

export default OrdenesPage;