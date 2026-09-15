import apiClient from './axiosConfig';

export const ventasPorPeriodo = async (desde, hasta) => {
    const response = await apiClient.get('/reportes/ventas-por-periodo', {
        params: { desde, hasta },
    });
    return response.data;
};

export const platillosMasVendidos = async (desde, hasta) => {
    const response = await apiClient.get('/reportes/platillos-mas-vendidos', {
        params: { desde, hasta },
    });
    return response.data;
};

export const resumenGeneral = async (desde, hasta) => {
    const response = await apiClient.get('/reportes/resumen-general', {
        params: { desde, hasta },
    });
    return response.data;
};