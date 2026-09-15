import apiClient from './axiosConfig';

export const listarRoles = async () => {
    const response = await apiClient.get('/roles');
    return response.data;
};