import api from './api';

export const getMinhaLista = async () => {
    try {
        const response = await api.get('/minha-lista');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar a lista pessoal de filmes:", error);
        throw error.response?.data || new Error("Não foi possível buscar a sua lista");
    }
};


export const adicionarNaLista = async (filmeId) => {
    try {
        const response = await api.post(`/minha-lista/filmes/${filmeId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar filme na lista:", error);
        throw error.response?.data || new Error("Não foi possível adicionar à lista");
    }
};

export const removerDaLista = async (filmeId) => {
    try {
        await api.delete(`/minha-lista/filmes/${filmeId}`);
    } catch (error) {
        console.error("Erro ao remover filme da lista:", error);
        throw error.response?.data || new Error("Não foi possível remover da lista");
    }
};

export const atualizarStatusVisto = async (filmeId, visto) => {
    try {
        const statusString = visto ? "TRUE" : "FALSE";

        const requestBody = {
            visto: statusString
        };

        const response = await api.put(
            `/minha-lista/filmes/${filmeId}/status`,
            requestBody
        );

        return response.data;

    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        throw error.response?.data || new Error("Não foi possível atualizar o status");
    }
};
