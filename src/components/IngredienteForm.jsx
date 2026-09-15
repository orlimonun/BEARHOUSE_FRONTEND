import { useState } from 'react';


function IngredienteForm({ ingrediente, categorias, onGuardar, onCancelar }) {
    const [form, setForm] = useState({
        nombre: ingrediente?.nombre ?? '',
        unidadMedida: ingrediente?.unidadMedida ?? '',
        stockMinimo: ingrediente?.stockMinimo ?? '',
        costoUnitario: ingrediente?.costoUnitario ?? '',
        categoriaId: ingrediente?.categoriaId ?? '',
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);
        try {
            await onGuardar({
                nombre: form.nombre,
                unidadMedida: form.unidadMedida,
                stockMinimo: form.stockMinimo === '' ? null : Number(form.stockMinimo),
                costoUnitario: form.costoUnitario === '' ? null : Number(form.costoUnitario),
                categoriaId: form.categoriaId === '' ? null : Number(form.categoriaId),
            });
        } catch (err) {
            setError('No se pudo guardar el ingrediente');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-bear-dark border border-bear-gold/20 rounded-xl p-6 mb-6"
        >
            <h2 className="text-xl font-bold text-bear-gold mb-4">
                {ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Nombre *</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Unidad de medida *</label>
                    <input
                        name="unidadMedida"
                        value={form.unidadMedida}
                        onChange={handleChange}
                        placeholder="kg, unidad, litro..."
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Stock mínimo</label>
                    <input
                        name="stockMinimo"
                        type="number"
                        step="0.001"
                        min="0"
                        value={form.stockMinimo}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Costo unitario (₡)</label>
                    <input
                        name="costoUnitario"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.costoUnitario}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-neutral-300 mb-1 text-sm">Categoría</label>
                    <select
                        name="categoriaId"
                        value={form.categoriaId}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="">Sin categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p className="text-bear-red text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50"
                >
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    type="button"
                    onClick={onCancelar}
                    className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default IngredienteForm;