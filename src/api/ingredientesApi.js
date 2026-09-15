import apiClient from './axiosConfig';

export const listarIngredientes = async () => {
    const response = await apiClient.get('/ingredientes');
    return response.data;
};

export const crearIngrediente = async (datos) => {
    const response = await apiClient.post('/ingredientes', datos);
    return response.data;
};

export const actualizarIngrediente = async (id, datos) => {
    const response = await apiClient.put(`/ingredientes/${id}`, datos);
    return response.data;
};

export const eliminarIngrediente = async (id) => {
    await apiClient.delete(`/ingredientes/${id}`);
};