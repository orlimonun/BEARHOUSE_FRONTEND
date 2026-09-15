import { useState, useRef } from 'react';
import { resumenGeneral, platillosMasVendidos } from '../api/reportesApi';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

function ReportesPage() {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    const aISO = (fecha) => fecha.toISOString().slice(0, 10);

    const [desde, setDesde] = useState(aISO(haceUnMes));
    const [hasta, setHasta] = useState(aISO(hoy));

    const [resumen, setResumen] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [consultado, setConsultado] = useState(false);
    const reporteRef = useRef(null);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const consultar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        try {
            const desdeCompleto = `${desde}T00:00:00`;
            const hastaCompleto = `${hasta}T23:59:59`;

            const [datosResumen, datosRanking] = await Promise.all([
                resumenGeneral(desdeCompleto, hastaCompleto),
                platillosMasVendidos(desdeCompleto, hastaCompleto),
            ]);

            setResumen(datosResumen);
            setRanking(datosRanking);
            setConsultado(true);
        } catch (err) {
            setError('No se pudieron generar los reportes');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const descargarPdf = async () => {
        if (!reporteRef.current) return;
        setGenerandoPdf(true);
        try {
            const canvas = await html2canvas(reporteRef.current, {
                backgroundColor: '#0d0d0d',
                scale: 2,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const anchoPdf = pdf.internal.pageSize.getWidth();
            const altoPdf = pdf.internal.pageSize.getHeight();
            const anchoImg = anchoPdf - 20;
            const altoImg = (canvas.height * anchoImg) / canvas.width;

            let posicionY = 10;
            let alturaRestante = altoImg;

            pdf.addImage(imgData, 'PNG', 10, posicionY, anchoImg, altoImg);
            alturaRestante -= altoPdf - 20;

            while (alturaRestante > 0) {
                posicionY = alturaRestante - altoImg + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, posicionY, anchoImg, altoImg);
                alturaRestante -= altoPdf;
            }

            pdf.save(`BEARHOUSE_Reporte_${desde}_a_${hasta}.pdf`);
        } catch (err) {
            alert('No se pudo generar el PDF');
            console.error(err);
        } finally {
            setGenerandoPdf(false);
        }
    };

    const formatearMonto = (n) =>
        `₡${Number(n ?? 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const etiquetaTipo = (tipo) => {
        if (tipo === 'PARA_LLEVAR') return 'Para llevar';
        if (tipo === 'EXPRESS') return 'Express';
        return 'Local';
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    const maxVendido = ranking.length > 0
        ? Math.max(...ranking.map((r) => Number(r.cantidadVendida)))
        : 0;

    return (
        <div>
            <h1 className="text-3xl font-bold text-bear-gold mb-6">Reportes</h1>

            <form onSubmit={consultar}
                  className="bg-bear-dark border border-bear-gold/20 rounded-xl p-4 mb-6 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                    <label className="block text-neutral-300 mb-1 text-sm">Desde</label>
                    <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
                           className={inputClass} required />
                </div>
                <div className="col-span-4">
                    <label className="block text-neutral-300 mb-1 text-sm">Hasta</label>
                    <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
                           className={inputClass} required />
                </div>
                <div className="col-span-4">
                    <button type="submit" disabled={cargando}
                            className="w-full bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50">
                        {cargando ? 'Generando...' : 'Generar reportes'}
                    </button>
                </div>
            </form>

            {error && <p className="text-bear-red mb-6">{error}</p>}

            {consultado && resumen && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={descargarPdf}
                            disabled={generandoPdf}
                            className="border border-bear-gold text-bear-gold hover:bg-bear-gold hover:text-bear-black font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {generandoPdf ? 'Generando PDF...' : '↓ Descargar PDF'}
                        </button>
                    </div>

                    <div ref={reporteRef} className="bg-bear-black p-6 rounded-xl">
                        <div className="mb-6 border-b border-bear-gold/30 pb-4">
                            <h2 className="text-2xl font-bold text-bear-gold">BEAR HOUSE BURGER</h2>
                            <p className="text-neutral-400 text-sm">
                                Reporte de ventas · {desde} al {hasta}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-bear-dark border border-bear-gold/20 rounded-xl p-5">
                                <p className="text-neutral-400 text-sm mb-1">Total facturado</p>
                                <p className="text-3xl font-bold text-bear-gold">
                                    {formatearMonto(resumen.totalFacturado)}
                                </p>
                            </div>
                            <div className="bg-bear-dark border border-bear-gold/20 rounded-xl p-5">
                                <p className="text-neutral-400 text-sm mb-1">Órdenes pagadas</p>
                                <p className="text-3xl font-bold text-white">{resumen.totalOrdenes ?? 0}</p>
                            </div>
                            <div className="bg-bear-dark border border-bear-gold/20 rounded-xl p-5">
                                <p className="text-neutral-400 text-sm mb-1">Ticket promedio</p>
                                <p className="text-3xl font-bold text-white">
                                    {formatearMonto(resumen.ticketPromedio)}
                                </p>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-bear-gold mb-3">Ventas por tipo de orden</h2>
                        <div className="overflow-x-auto rounded-xl border border-bear-gold/20 mb-8">
                            <table className="w-full text-left">
                                <thead>
                                <tr className="bg-bear-dark text-bear-gold text-sm">
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Órdenes</th>
                                    <th className="px-4 py-3">Facturado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {resumen.desglosePorTipo?.map((d) => (
                                    <tr key={d.tipo} className="border-t border-bear-gold/10 text-neutral-200">
                                        <td className="px-4 py-3">{etiquetaTipo(d.tipo)}</td>
                                        <td className="px-4 py-3">{d.cantidadOrdenes}</td>
                                        <td className="px-4 py-3 font-semibold">{formatearMonto(d.totalFacturado)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {(!resumen.desglosePorTipo || resumen.desglosePorTipo.length === 0) && (
                            <p className="text-neutral-400 -mt-6 mb-8">Sin ventas en este período.</p>
                        )}

                        <h2 className="text-xl font-semibold text-bear-gold mb-3">Platillos más vendidos</h2>
                        {ranking.length === 0 ? (
                            <p className="text-neutral-400">Sin datos de ventas en este período.</p>
                        ) : (
                            <div className="bg-bear-dark border border-bear-gold/20 rounded-xl p-5 space-y-3">
                                {ranking.map((item, index) => {
                                    const porcentaje = maxVendido > 0
                                        ? (Number(item.cantidadVendida) / maxVendido) * 100
                                        : 0;
                                    return (
                                        <div key={item.platilloNombre}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-neutral-200">
                                                    <span className="text-bear-gold font-semibold mr-2">#{index + 1}</span>
                                                    {item.platilloNombre}
                                                </span>
                                                <span className="text-neutral-400">{item.cantidadVendida} vendidos</span>
                                            </div>
                                            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-bear-gold rounded-full transition-all"
                                                    style={{ width: `${porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {!consultado && !cargando && (
                <p className="text-neutral-400">
                    Elegí un rango de fechas y generá los reportes.
                </p>
            )}
        </div>
    );
}

export default ReportesPage;