import api from './api';

export const getMe = async () => {
    try {
        const response = await api.get('/usuarios/me');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        throw error.response?.data || new Error("Não foi possível buscar dados do usuário");
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/usuarios/me', profileData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error.response?.data || new Error("Não foi possível atualizar o perfil");
    }
};

export const updatePassword = async (passwordData) => {
    try {
        const response = await api.put('/usuarios/alterar-senha', passwordData);
        return response.data;
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        throw error.response?.data || new Error("Não foi possível alterar a senha");
    }
};

export const deleteMyAccount = async () => {
    await api.delete('/usuarios/me');
};


// --- FUNÇÕES PARA ADMIN ---
export const getTodosUsuarios = async () => {
    const response = await api.get('/usuarios');
    return response.data;
};

export const updateUsuarioRole = async (id, novoRole) => {
    const response = await api.put(`/usuarios/${id}/role`, JSON.stringify(novoRole), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};