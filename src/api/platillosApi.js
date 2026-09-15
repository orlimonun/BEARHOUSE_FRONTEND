import apiClient from './axiosConfig';

export const listarPlatillos = async () => {
    const response = await apiClient.get('/platillos');
    return response.data;
};

export const crearPlatillo = async (datos) => {
    const response = await apiClient.post('/platillos', datos);
    return response.data;
};

export const actualizarPlatillo = async (id, datos) => {
    const response = await apiClient.put(`/platillos/${id}`, datos);
    return response.data;
};

export const eliminarPlatillo = async (id) => {
    await apiClient.delete(`/platillos/${id}`);
};