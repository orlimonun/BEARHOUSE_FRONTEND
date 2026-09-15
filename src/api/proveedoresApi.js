import apiClient from './axiosConfig';

export const listarProveedores = async () => {
    const response = await apiClient.get('/proveedores');
    return response.data;
};

export const crearProveedor = async (datos) => {
    const response = await apiClient.post('/proveedores', datos);
    return response.data;
};

export const actualizarProveedor = async (id, datos) => {
    const response = await apiClient.put(`/proveedores/${id}`, datos);
    return response.data;
};

export const eliminarProveedor = async (id) => {
    await apiClient.delete(`/proveedores/${id}`);
};
