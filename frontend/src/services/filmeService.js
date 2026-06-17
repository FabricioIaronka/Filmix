import api from './api';

//O token JWT será anexado automaticamente pelo intercetador do api.js.
export const getFilmes = async () => {
    try {
        const response = await api.get('/filmes');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        throw error.response?.data || new Error("Não foi possível buscar os filmes");
    }
};

export const createFilme = async (filmeData) => {
    try {
        const response = await api.post('/filmes', filmeData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar filme:", error);
        throw error.response?.data || new Error("Não foi possível criar o filme");
    }
};

export const updateFilme = async (id, filmeData) => {
    try {
        const response = await api.put(`/filmes/${id}`, filmeData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar filme:", error);
        throw error.response?.data || new Error("Não foi possível atualizar o filme");
    }
};

export const deleteFilme = async (id) => {
    try {
        await api.delete(`/filmes/${id}`);
    } catch (error) {
        console.error("Erro ao excluir filme:", error);
        throw error.response?.data || new Error("Não foi possível excluir o filme");
    }
};

export const getMinhasEstatisticas = async () => {
    try {
        const response = await api.get('/estatisticas/usuario');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar estatísticas do usuário:", error);
        throw error;
    }
};