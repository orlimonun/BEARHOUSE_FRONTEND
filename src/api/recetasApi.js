import apiClient from './axiosConfig';

export const verRecetaDePlatillo = async (platilloId) => {
    const response = await apiClient.get(`/recetas/platillo/${platilloId}`);
    return response.data;
};

export const agregarIngredienteReceta = async (datos) => {
    const response = await apiClient.post('/recetas', datos);
    return response.data;
};

export const actualizarLineaReceta = async (id, datos) => {
    const response = await apiClient.put(`/recetas/${id}`, datos);
    return response.data;
};

export const quitarIngredienteReceta = async (id) => {
    await apiClient.delete(`/recetas/${id}`);
};