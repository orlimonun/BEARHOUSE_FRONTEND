import { useState } from 'react';

function EmpleadoForm({ empleado, roles, onGuardar, onCancelar }) {
    const [form, setForm] = useState({
        nombre: empleado?.nombre ?? '',
        apellidos: empleado?.apellidos ?? '',
        cedula: empleado?.cedula ?? '',
        telefono: empleado?.telefono ?? '',
        correo: empleado?.correo ?? '',
        usuario: empleado?.usuario ?? '',
        password: '',
        salario: empleado?.salario ?? '',
        fechaIngreso: empleado?.fechaIngreso ?? '',
        rolId: empleado?.rolId ?? '',
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const esEdicion = Boolean(empleado);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!esEdicion && !form.password) {
            setError('La contraseña es obligatoria al crear un empleado');
            return;
        }

        setGuardando(true);
        try {
            await onGuardar({
                nombre: form.nombre,
                apellidos: form.apellidos,
                cedula: form.cedula || null,
                telefono: form.telefono || null,
                correo: form.correo || null,
                usuario: form.usuario,
                password: form.password || null,
                salario: form.salario === '' ? null : Number(form.salario),
                fechaIngreso: form.fechaIngreso || null,
                rolId: Number(form.rolId),
            });
        } catch (err) {
            setError('No se pudo guardar. Revisá que el usuario, cédula o correo no estén repetidos.');
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
                {esEdicion ? 'Editar empleado' : 'Nuevo empleado'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} required />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Apellidos *</label>
                    <input name="apellidos" value={form.apellidos} onChange={handleChange} className={inputClass} required />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Cédula</label>
                    <input name="cedula" value={form.cedula} onChange={handleChange} className={inputClass} />
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
                    <label className="block text-neutral-300 mb-1 text-sm">Rol *</label>
                    <select name="rolId" value={form.rolId} onChange={handleChange} className={inputClass} required>
                        <option value="">Seleccioná un rol</option>
                        {roles.map((rol) => (
                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Usuario *</label>
                    <input name="usuario" value={form.usuario} onChange={handleChange}
                           placeholder="jperez" className={inputClass} required />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">
                        Contraseña {esEdicion ? '' : '*'}
                    </label>
                    <input name="password" type="password" value={form.password} onChange={handleChange}
                           placeholder={esEdicion ? 'Dejar vacío para no cambiarla' : ''}
                           className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Salario (₡)</label>
                    <input name="salario" type="number" step="0.01" min="0"
                           value={form.salario} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-neutral-300 mb-1 text-sm">Fecha de ingreso</label>
                    <input name="fechaIngreso" type="date" value={form.fechaIngreso}
                           onChange={handleChange} className={inputClass} />
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

export default EmpleadoForm;