import apiClient from './axiosConfig';

export const listarCategoriasIngrediente = async () => {
    const response = await apiClient.get('/categorias-ingrediente');
    return response.data;
};

export const crearCategoriaIngrediente = async (datos) => {
    const response = await apiClient.post('/categorias-ingrediente', datos);
    return response.data;
};

export const actualizarCategoriaIngrediente = async (id, datos) => {
    const response = await apiClient.put(`/categorias-ingrediente/${id}`, datos);
    return response.data;
};

export const eliminarCategoriaIngrediente = async (id) => {
    await apiClient.delete(`/categorias-ingrediente/${id}`);
};