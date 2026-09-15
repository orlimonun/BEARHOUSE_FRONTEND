import apiClient from './axiosConfig';

export const listarMesas = async () => {
    const response = await apiClient.get('/mesas');
    return response.data;
};

export const crearMesa = async (datos) => {
    const response = await apiClient.post('/mesas', datos);
    return response.data;
};

export const actualizarMesa = async (id, datos) => {
    const response = await apiClient.put(`/mesas/${id}`, datos);
    return response.data;
};

export const eliminarMesa = async (id) => {
    await apiClient.delete(`/mesas/${id}`);
};