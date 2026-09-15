import apiClient from './axiosConfig';

export const login = async (usuario, password) =>{
    const response = await apiClient.post('/auth/login',
        {usuario, password,});
    return response.data;
};