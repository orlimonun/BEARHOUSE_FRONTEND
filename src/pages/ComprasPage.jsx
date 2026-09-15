import { useState, useEffect } from 'react';
import { listarCompras, crearCompra } from '../api/comprasApi';
import { listarProveedores } from '../api/proveedoresApi';
import { listarIngredientes } from '../api/ingredientesApi';
import CompraForm from '../components/CompraForm';

function ComprasPage() {
    const [compras, setCompras] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
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
                const [datosCom, datosProv, datosIng] = await Promise.all([
                    listarCompras(),
                    listarProveedores(),
                    listarIngredientes(),
                ]);
                if (!cancelado) {
                    setCompras(datosCom);
                    setProveedores(datosProv);
                    setIngredientes(datosIng);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar las compras');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const handleGuardar = async (datos) => {
        await crearCompra(datos);
        setCompras(await listarCompras());
        setMostrarForm(false);
    };

    const formatearFecha = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('es-CR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatearMonto = (n) =>
        `₡${Number(n ?? 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const formatearNumeroCompra = (id) => `F-${String(id).padStart(3, '0')}`;

    if (cargando) return <p className="text-neutral-400">Cargando compras...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Compras</h1>
                {!mostrarForm && (
                    <button onClick={() => setMostrarForm(true)}
                            className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition">
                        + Registrar compra
                    </button>
                )}
            </div>

            {mostrarForm && (
                <CompraForm
                    proveedores={proveedores}
                    ingredientes={ingredientes}
                    onGuardar={handleGuardar}
                    onCancelar={() => setMostrarForm(false)}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">N° compra</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Proveedor</th>
                        <th className="px-4 py-3">N° factura</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3 text-right">Detalle</th>
                    </tr>
                    </thead>
                    <tbody>
                    {compras.map((compra) => (
                        <>
                            <tr key={compra.id}
                                className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                                <td className="px-4 py-3 font-semibold text-bear-gold">
                                    {formatearNumeroCompra(compra.id)}
                                </td>
                                <td className="px-4 py-3">{formatearFecha(compra.fecha)}</td>
                                <td className="px-4 py-3">{compra.proveedorNombre}</td>
                                <td className="px-4 py-3">{compra.numFactura || '—'}</td>
                                <td className="px-4 py-3 font-semibold">{formatearMonto(compra.total)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => setExpandida(expandida === compra.id ? null : compra.id)}
                                        className="text-bear-gold hover:underline"
                                    >
                                        {expandida === compra.id ? 'Ocultar' : 'Ver'}
                                    </button>
                                </td>
                            </tr>

                            {expandida === compra.id && (
                                <tr key={`${compra.id}-detalle`} className="bg-black/30">
                                    <td colSpan={6} className="px-8 py-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr className="text-bear-gold/70">
                                                <th className="text-left py-2">Ingrediente</th>
                                                <th className="text-left py-2">Cantidad</th>
                                                <th className="text-left py-2">Costo unit.</th>
                                                <th className="text-left py-2">Subtotal</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {compra.detalles?.map((d) => (
                                                <tr key={d.id} className="text-neutral-300">
                                                    <td className="py-1">{d.ingredienteNombre}</td>
                                                    <td className="py-1">{d.cantidad}</td>
                                                    <td className="py-1">{formatearMonto(d.costoUnitario)}</td>
                                                    <td className="py-1">{formatearMonto(d.subtotal)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    </tbody>
                </table>
            </div>

            {compras.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay compras registradas todavía.</p>
            )}
        </div>
    );
}

export default ComprasPage;