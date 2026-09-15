import { createContext, useContext, useState } from 'react';
import { login as loginApi } from '../api/authApi';

 export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(localStorage.getItem('usuario'));
    const [rol, setRol] = useState(localStorage.getItem('rol'));

    const login = async (usuarioInput, password) => {
        const data = await loginApi(usuarioInput, password);

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', data.usuario);
        localStorage.setItem('rol', data.rol);

        setUsuario(data.usuario);
        setRol(data.rol);

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol');
        setUsuario(null);
        setRol(null);
    };

    const estaAutenticado = !!usuario;

    return (
        <AuthContext.Provider value={{ usuario, rol, login, logout, estaAutenticado }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}