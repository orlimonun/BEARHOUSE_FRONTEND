import apiClient from './axiosConfig';

export const listarOrdenes = async () => {
    const response = await apiClient.get('/ordenes');
    return response.data;
};

export const crearOrden = async (datos) => {
    const response = await apiClient.post('/ordenes', datos);
    return response.data;
};

export const pagarOrden = async (id, metodoPago) => {
    const url = metodoPago
        ? `/ordenes/${id}/pagar?metodoPago=${metodoPago}`
        : `/ordenes/${id}/pagar`;
    const response = await apiClient.patch(url);
    return response.data;
};

export const cancelarOrden = async (id) => {
    const response = await apiClient.patch(`/ordenes/${id}/cancelar`);
    return response.data;
};