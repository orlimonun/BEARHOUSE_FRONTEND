import apiClient from './axiosConfig';

export const listarPagosDeOrden = async (ordenId) => {
    const response = await apiClient.get(`/ordenes/${ordenId}/pagos`);
    return response.data;
};

export const registrarPago = async (ordenId, datos) => {
    const response = await apiClient.post(`/ordenes/${ordenId}/pagos`, datos);
    return response.data;
};