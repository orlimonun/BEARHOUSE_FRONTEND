import { useState } from 'react';

const lineaVacia = { ingredienteId: '', cantidad: '', costoUnitario: '' };

function CompraForm({ proveedores, ingredientes, onGuardar, onCancelar }) {
    const [proveedorId, setProveedorId] = useState('');
    const [numFactura, setNumFactura] = useState('');
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

    const quitarLinea = (index) =>
        setDetalles((prev) => prev.filter((_, i) => i !== index));

    const total = detalles.reduce((acc, l) => {
        const cant = Number(l.cantidad) || 0;
        const costo = Number(l.costoUnitario) || 0;
        return acc + cant * costo;
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const lineasValidas = detalles.filter(
            (l) => l.ingredienteId && Number(l.cantidad) > 0
        );
        if (lineasValidas.length === 0) {
            setError('Agregá al menos un ingrediente con cantidad');
            return;
        }

        setGuardando(true);
        try {
            await onGuardar({
                proveedorId: Number(proveedorId),
                numFactura: numFactura || null,
                observaciones: observaciones || null,
                detalles: lineasValidas.map((l) => ({
                    ingredienteId: Number(l.ingredienteId),
                    cantidad: Number(l.cantidad),
                    costoUnitario: Number(l.costoUnitario) || 0,
                })),
            });
        } catch (err) {
            setError('No se pudo registrar la compra');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    return (
        <form onSubmit={handleSubmit} className="bg-bear-dark border border-bear-gold/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-bear-gold mb-4">Registrar compra</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Proveedor *</label>
                    <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}
                            className={inputClass} required>
                        <option value="">Seleccioná un proveedor</option>
                        {proveedores.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">N° de factura</label>
                    <input value={numFactura} onChange={(e) => setNumFactura(e.target.value)} className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Observaciones</label>
                    <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={inputClass} />
                </div>
            </div>

            <h3 className="text-bear-gold font-semibold mb-3">Ingredientes comprados</h3>

            <div className="space-y-3">
                {detalles.map((linea, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                            <label className="block text-neutral-400 mb-1 text-xs">Ingrediente</label>
                            <select
                                value={linea.ingredienteId}
                                onChange={(e) => handleDetalleChange(index, 'ingredienteId', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Seleccioná...</option>
                                {ingredientes.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.nombre} ({ing.unidadMedida})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-3">
                            <label className="block text-neutral-400 mb-1 text-xs">Cantidad</label>
                            <input type="number" step="0.001" min="0"
                                   value={linea.cantidad}
                                   onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                                   className={inputClass} />
                        </div>

                        <div className="col-span-3">
                            <label className="block text-neutral-400 mb-1 text-xs">Costo unitario (₡)</label>
                            <input type="number" step="0.01" min="0"
                                   value={linea.costoUnitario}
                                   onChange={(e) => handleDetalleChange(index, 'costoUnitario', e.target.value)}
                                   className={inputClass} />
                        </div>

                        <div className="col-span-1">
                            {detalles.length > 1 && (
                                <button type="button" onClick={() => quitarLinea(index)}
                                        className="text-bear-red hover:underline text-sm pb-2">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={agregarLinea}
                    className="mt-3 text-bear-gold hover:underline text-sm">
                + Agregar otro ingrediente
            </button>

            <div className="mt-6 pt-4 border-t border-bear-gold/20 flex items-center justify-between">
                <span className="text-neutral-300">Total estimado:</span>
                <span className="text-2xl font-bold text-bear-gold">
          ₡{total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
        </span>
            </div>

            {error && <p className="text-bear-red text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
                <button type="submit" disabled={guardando}
                        className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50">
                    {guardando ? 'Registrando...' : 'Registrar compra'}
                </button>
                <button type="button" onClick={onCancelar}
                        className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default CompraForm;