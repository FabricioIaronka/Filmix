import api from './api';

export const login = async (email, senha) => {
    try {
        const response = await api.post('/auth/login', { email, senha });

        if (response.data.token) {
            // salva o Token
            localStorage.setItem('token', response.data.token);

            // salva Nome/Role para mostrar na Sidebar e controlar acesso Admin
            localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Falha no login');
    }
};

// Envia os dados para criar conta no banco
export const registrar = async (nome, email, senha) => {
    try {
        const response = await api.post('/usuarios/registrar', { nome, email, senha });
        return response.data;
    } catch (error) {
        console.error("Erro no registo:", error);
        throw error.response?.data || new Error("Não foi possível realizar o registo");
    }
};

// Limpa tudo do navegador para deslogar
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};