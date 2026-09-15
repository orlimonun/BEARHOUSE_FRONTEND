import { useState, useEffect } from 'react';
import { listarOrdenes, crearOrden, pagarOrden, cancelarOrden } from '../api/ordenesApi';
import { listarPlatillos } from '../api/platillosApi';
import { listarMesas } from '../api/mesasApi';
import OrdenForm from '../components/OrdenForm';

function OrdenesPage() {
    const [ordenes, setOrdenes] = useState([]);
    const [platillos, setPlatillos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [expandida, setExpandida] = useState(null);

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

    const refrescar = async () => setOrdenes(await listarOrdenes());

    const handleGuardar = async (datos) => {
        await crearOrden(datos);
        await refrescar();
        setMostrarForm(false);
    };

    const handlePagar = async (orden) => {
        const metodo = orden.metodoPago || window.prompt(
            'Método de pago (EFECTIVO, TARJETA, SINPE, OTRO):', 'EFECTIVO'
        );
        if (metodo === null) return;
        try {
            await pagarOrden(orden.id, metodo ? metodo.toUpperCase() : null);
            await refrescar();
        } catch (err) {
            alert('No se pudo marcar como pagada');
            console.error(err);
        }
    };

    const handleCancelar = async (orden) => {
        if (!window.confirm(
            `¿Cancelar la orden #${orden.id}? Los ingredientes volverán al inventario.`
        )) return;
        try {
            await cancelarOrden(orden.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo cancelar la orden');
            console.error(err);
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
        return 'text-bear-gold';
    };

    const etiquetaTipo = (tipo) => {
        if (tipo === 'PARA_LLEVAR') return 'Para llevar';
        if (tipo === 'EXPRESS') return 'Express';
        return 'Local';
    };

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
                                    {orden.estado}
                                </td>
                                <td className="px-4 py-3 font-semibold">{formatearMonto(orden.total)}</td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => setExpandida(expandida === orden.id ? null : orden.id)}
                                        className="text-neutral-400 hover:text-bear-gold hover:underline mr-4"
                                    >
                                        {expandida === orden.id ? 'Ocultar' : 'Ver'}
                                    </button>
                                    {orden.estado === 'ABIERTA' && (
                                        <button onClick={() => handlePagar(orden)}
                                                className="text-green-400 hover:underline mr-4">
                                            Pagar
                                        </button>
                                    )}
                                    {orden.estado !== 'CANCELADA' && (
                                        <button onClick={() => handleCancelar(orden)}
                                                className="text-bear-red hover:underline">
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>

                            {expandida === orden.id && (
                                <tr key={`${orden.id}-detalle`} className="bg-black/30">
                                    <td colSpan={6} className="px-8 py-4">
                                        <table className="w-full text-sm mb-4">
                                            <thead>
                                            <tr className="text-bear-gold/70">
                                                <th className="text-left py-2">Platillo</th>
                                                <th className="text-left py-2">Cantidad</th>
                                                <th className="text-left py-2">Precio unit.</th>
                                                <th className="text-left py-2">Subtotal</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {orden.detalles?.map((d) => (
                                                <tr key={d.id} className="text-neutral-300">
                                                    <td className="py-1">{d.platilloNombre}</td>
                                                    <td className="py-1">{d.cantidad}</td>
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
                                            {orden.metodoPago && <div>Método de pago: {orden.metodoPago}</div>}
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
        </div>
    );
}

export default OrdenesPage;