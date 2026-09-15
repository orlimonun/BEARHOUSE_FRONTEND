import { useState } from 'react';

function ProveedorForm({ proveedor, onGuardar, onCancelar }) {
    const [form, setForm] = useState({
        nombre: proveedor?.nombre ?? '',
        contacto: proveedor?.contacto ?? '',
        telefono: proveedor?.telefono ?? '',
        correo: proveedor?.correo ?? '',
        direccion: proveedor?.direccion ?? '',
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
                contacto: form.contacto || null,
                telefono: form.telefono || null,
                correo: form.correo || null,
                direccion: form.direccion || null,
            });
        } catch (err) {
            setError('No se pudo guardar el proveedor');
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
                {proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-neutral-300 mb-1 text-sm">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} required />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Contacto</label>
                    <input name="contacto" value={form.contacto} onChange={handleChange}
                           placeholder="Nombre de la persona" className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Correo</label>
                    <input name="correo" type="email" value={form.correo} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} />
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

export default ProveedorForm;