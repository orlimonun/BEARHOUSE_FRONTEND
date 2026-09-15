import { useState } from 'react';

const lineaVacia = { platilloId: '', cantidad: '1' };
const TARIFA_TRANSPORTE = 1000;
const KM_POR_BLOQUE = 3;

function OrdenForm({ platillos, mesas, onGuardar, onCancelar }) {
    const [tipo, setTipo] = useState('PARA_LLEVAR');
    const [mesaId, setMesaId] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [kilometros, setKilometros] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [detalles, setDetalles] = useState([{ ...lineaVacia }]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleDetalleChange = (index, campo, valor) => {
        setDetalles((prev) =>
            prev.map((linea, i) => (i === index ? { ...linea, [campo]: valor } : linea))
        );
    };

    const agregarLinea = () => setDetalles((prev) => [...prev, { ...lineaVacia }]);
    const quitarLinea = (index) => setDetalles((prev) => prev.filter((_, i) => i !== index));

    const precioDe = (platilloId) => {
        const p = platillos.find((pl) => String(pl.id) === String(platilloId));
        return p ? Number(p.precio) : 0;
    };

    const subtotal = detalles.reduce((acc, l) => {
        return acc + precioDe(l.platilloId) * (Number(l.cantidad) || 0);
    }, 0);

    const calcularTransporte = () => {
        if (tipo !== 'EXPRESS') return 0;
        const km = Number(kilometros) || 0;
        if (km <= 0) return TARIFA_TRANSPORTE;
        return Math.ceil(km / KM_POR_BLOQUE) * TARIFA_TRANSPORTE;
    };

    const transporte = calcularTransporte();
    const total = subtotal + transporte;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const lineasValidas = detalles.filter((l) => l.platilloId && Number(l.cantidad) > 0);
        if (lineasValidas.length === 0) {
            setError('Agregá al menos un platillo');
            return;
        }
        if (tipo === 'LOCAL' && !mesaId) {
            setError('Una orden en local necesita una mesa asignada');
            return;
        }

        setGuardando(true);
        try {
            await onGuardar({
                tipo,
                mesaId: mesaId === '' ? null : Number(mesaId),
                metodoPago: metodoPago || null,
                kilometros: tipo === 'EXPRESS' && kilometros ? Number(kilometros) : null,
                observaciones: observaciones || null,
                detalles: lineasValidas.map((l) => ({
                    platilloId: Number(l.platilloId),
                    cantidad: Number(l.cantidad),
                })),
            });
        } catch (err) {
            setError('No se pudo registrar la orden');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    const formatearMonto = (n) =>
        `₡${Number(n).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    return (
        <form onSubmit={handleSubmit} className="bg-bear-dark border border-bear-gold/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-bear-gold mb-4">Nueva orden</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Tipo *</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
                        <option value="PARA_LLEVAR">Para llevar</option>
                        <option value="EXPRESS">Express (delivery)</option>
                        <option value="LOCAL">En local (mesa)</option>
                    </select>
                </div>

                {tipo === 'LOCAL' && (
                    <div>
                        <label className="block text-neutral-300 mb-1 text-sm">Mesa *</label>
                        <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} className={inputClass}>
                            <option value="">Seleccioná...</option>
                            {mesas.map((m) => (
                                <option key={m.id} value={m.id}>Mesa {m.numero}</option>
                            ))}
                        </select>
                    </div>
                )}

                {tipo === 'EXPRESS' && (
                    <div>
                        <label className="block text-neutral-300 mb-1 text-sm">Kilómetros</label>
                        <input type="number" step="0.1" min="0" value={kilometros}
                               onChange={(e) => setKilometros(e.target.value)}
                               placeholder="7" className={inputClass} />
                    </div>
                )}

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Método de pago</label>
                    <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inputClass}>
                        <option value="">Sin definir</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="SINPE">SINPE</option>
                        <option value="OTRO">Otro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Observaciones</label>
                    <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                           placeholder="Sin cebolla, etc." className={inputClass} />
                </div>
            </div>

            <h3 className="text-bear-gold font-semibold mb-3">Platillos</h3>

            <div className="space-y-3">
                {detalles.map((linea, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-6">
                            <label className="block text-neutral-400 mb-1 text-xs">Platillo</label>
                            <select value={linea.platilloId}
                                    onChange={(e) => handleDetalleChange(index, 'platilloId', e.target.value)}
                                    className={inputClass}>
                                <option value="">Seleccioná...</option>
                                {platillos.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} — {formatearMonto(p.precio)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-neutral-400 mb-1 text-xs">Cantidad</label>
                            <input type="number" min="1" step="1" value={linea.cantidad}
                                   onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                                   className={inputClass} />
                        </div>

                        <div className="col-span-3">
                            <label className="block text-neutral-400 mb-1 text-xs">Subtotal</label>
                            <div className="px-3 py-2 text-neutral-300">
                                {formatearMonto(precioDe(linea.platilloId) * (Number(linea.cantidad) || 0))}
                            </div>
                        </div>

                        <div className="col-span-1">
                            {detalles.length > 1 && (
                                <button type="button" onClick={() => quitarLinea(index)}
                                        className="text-bear-red hover:underline text-sm pb-2">✕</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={agregarLinea} className="mt-3 text-bear-gold hover:underline text-sm">
                + Agregar otro platillo
            </button>

            <div className="mt-6 pt-4 border-t border-bear-gold/20 space-y-1">
                <div className="flex justify-between text-neutral-300">
                    <span>Subtotal:</span>
                    <span>{formatearMonto(subtotal)}</span>
                </div>
                {tipo === 'EXPRESS' && (
                    <div className="flex justify-between text-neutral-300">
                        <span>Transporte {kilometros ? `(${kilometros} km)` : '(mínimo)'}:</span>
                        <span>{formatearMonto(transporte)}</span>
                    </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-bear-gold pt-2">
                    <span>Total:</span>
                    <span>{formatearMonto(total)}</span>
                </div>
            </div>

            {error && <p className="text-bear-red text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
                <button type="submit" disabled={guardando}
                        className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50">
                    {guardando ? 'Registrando...' : 'Registrar orden'}
                </button>
                <button type="button" onClick={onCancelar}
                        className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default OrdenForm;