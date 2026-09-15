import { useState, useEffect } from 'react';
import {
    listarEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado,
} from '../api/empleadosApi';
import { listarRoles } from '../api/rolesApi';
import EmpleadoForm from '../components/EmpleadoForm';

function EmpleadosPage() {
    const [empleados, setEmpleados] = useState([]);
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        let cancelado = false;
        async function cargar() {
            setCargando(true);
            try {
                const [datosEmp, datosRol] = await Promise.all([listarEmpleados(), listarRoles()]);
                if (!cancelado) {
                    setEmpleados(datosEmp);
                    setRoles(datosRol);
                }
            } catch (err) {
                if (!cancelado) setError('No se pudieron cargar los empleados');
                console.error(err);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }
        cargar();
        return () => { cancelado = true; };
    }, []);

    const refrescar = async () => setEmpleados(await listarEmpleados());

    const handleGuardar = async (datos) => {
        if (editando) {
            await actualizarEmpleado(editando.id, datos);
        } else {
            await crearEmpleado(datos);
        }
        await refrescar();
        setMostrarForm(false);
        setEditando(null);
    };

    const handleEliminar = async (emp) => {
        if (!window.confirm(`¿Eliminar a ${emp.nombre} ${emp.apellidos}?`)) return;
        try {
            await eliminarEmpleado(emp.id);
            await refrescar();
        } catch (err) {
            alert('No se pudo eliminar. Puede que tenga órdenes o compras asociadas.');
            console.error(err);
        }
    };

    if (cargando) return <p className="text-neutral-400">Cargando empleados...</p>;
    if (error) return <p className="text-bear-red">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-bear-gold">Empleados</h1>
                {!mostrarForm && (
                    <button onClick={() => { setEditando(null); setMostrarForm(true); }}
                            className="bg-bear-gold hover:bg-bear-amber text-bear-black font-bold px-5 py-2 rounded-lg transition">
                        + Nuevo empleado
                    </button>
                )}
            </div>

            {mostrarForm && (
                <EmpleadoForm
                    key={editando?.id ?? 'nuevo'}
                    empleado={editando}
                    roles={roles}
                    onGuardar={handleGuardar}
                    onCancelar={() => { setMostrarForm(false); setEditando(null); }}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-bear-gold/20">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-bear-dark text-bear-gold text-sm">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Usuario</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Teléfono</th>
                        <th className="px-4 py-3">Activo</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {empleados.map((emp) => (
                        <tr key={emp.id} className="border-t border-bear-gold/10 text-neutral-200 hover:bg-bear-dark/50">
                            <td className="px-4 py-3">{emp.nombre} {emp.apellidos}</td>
                            <td className="px-4 py-3">{emp.usuario}</td>
                            <td className="px-4 py-3">
                                <span className="text-bear-gold">{emp.rolNombre}</span>
                            </td>
                            <td className="px-4 py-3">{emp.telefono || '—'}</td>
                            <td className="px-4 py-3">
                                {emp.activo ? (
                                    <span className="text-green-400">Sí</span>
                                ) : (
                                    <span className="text-bear-red">No</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={() => { setEditando(emp); setMostrarForm(true); }}
                                        className="text-bear-gold hover:underline mr-4">
                                    Editar
                                </button>
                                <button onClick={() => handleEliminar(emp)} className="text-bear-red hover:underline">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {empleados.length === 0 && (
                <p className="text-neutral-400 mt-4">No hay empleados registrados.</p>
            )}
        </div>
    );
}

export default EmpleadosPage;