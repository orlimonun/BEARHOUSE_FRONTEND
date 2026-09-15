import apiClient from './axiosConfig';

export const listarCategoriasPlatillo = async () => {
    const response = await apiClient.get('/categorias-platillo');
    return response.data;
};

export const crearCategoriaPlatillo = async (datos) => {
    const response = await apiClient.post('/categorias-platillo', datos);
    return response.data;
};

export const actualizarCategoriaPlatillo = async (id, datos) => {
    const response = await apiClient.put(`/categorias-platillo/${id}`, datos);
    return response.data;
};

export const eliminarCategoriaPlatillo = async (id) => {
    await apiClient.delete(`/categorias-platillo/${id}`);
};