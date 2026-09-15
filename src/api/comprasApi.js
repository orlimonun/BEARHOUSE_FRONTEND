import apiClient from './axiosConfig';

export const listarCompras = async () => {
    const response = await apiClient.get('/compras');
    return response.data;
};

export const crearCompra = async (datos) => {
    const response = await apiClient.post('/compras', datos);
    return response.data;
};