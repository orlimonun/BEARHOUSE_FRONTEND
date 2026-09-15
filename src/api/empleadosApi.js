import apiClient from './axiosConfig';

export const listarEmpleados = async () => {
    const response = await apiClient.get('/empleados');
    return response.data;
};

export const crearEmpleado = async (datos) => {
    const response = await apiClient.post('/empleados', datos);
    return response.data;
};

export const actualizarEmpleado = async (id, datos) => {
    const response = await apiClient.put(`/empleados/${id}`, datos);
    return response.data;
};

export const eliminarEmpleado = async (id) => {
    await apiClient.delete(`/empleados/${id}`);
};