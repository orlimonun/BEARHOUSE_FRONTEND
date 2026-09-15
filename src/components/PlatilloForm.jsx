import { useState } from 'react';

function PlatilloForm({ platillo, categorias, onGuardar, onCancelar }) {
    const [form, setForm] = useState({
        nombre: platillo?.nombre ?? '',
        descripcion: platillo?.descripcion ?? '',
        precio: platillo?.precio ?? '',
        categoriaId: platillo?.categoriaId ?? '',
        disponible: platillo?.disponible ?? true,
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: checked }));
    };

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
                descripcion: form.descripcion || null,
                precio: Number(form.precio),
                categoriaId: form.categoriaId === '' ? null : Number(form.categoriaId),
                disponible: form.disponible,
            });
        } catch (err) {
            setError('No se pudo guardar el platillo');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    const inputClass =
        'w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition';

    return (
        <form onSubmit={handleSubmit} className="bg-bear-dark border border-bear-gold/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-bear-gold mb-4">
                {platillo ? 'Editar platillo' : 'Nuevo platillo'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange}
                           placeholder="Cheesebacon, Osipapas..." className={inputClass} required />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Precio (₡) *</label>
                    <input name="precio" type="number" step="0.01" min="0"
                           value={form.precio} onChange={handleChange} className={inputClass} required />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-neutral-300 mb-1 text-sm">Descripción</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                              rows={2} placeholder="Ingredientes que lleva, como aparece en el menú..."
                              className={inputClass} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-neutral-300 mb-1 text-sm">Categoría</label>
                    <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className={inputClass}>
                        <option value="">Sin categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="disponible"
                            checked={form.disponible}
                            onChange={handleCheckbox}
                            className="w-5 h-5 accent-bear-gold cursor-pointer"
                        />
                        <span className="text-neutral-300 text-sm">Disponible en el menú</span>
                        <span className="text-neutral-500 text-xs">
                            (desmarcá para ocultarlo temporalmente)
                        </span>
                    </label>
                </div>
            </div>

            {error && <p className="text-bear-red text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
                <button type="submit" disabled={guardando}
                        className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition disabled:opacity-50">
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={onCancelar}
                        className="border border-bear-gold/30 text-neutral-300 hover:text-bear-gold px-5 py-2 rounded-lg transition">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default PlatilloForm;