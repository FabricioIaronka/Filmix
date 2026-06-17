import api from './api';

export const getAvaliacoesPorFilme = async (filmeId) => {
    try {
        const response = await api.get(`/filmes/${filmeId}/avaliacoes`);

        // Retorna o array de avaliações para o componente
        return response.data;

    } catch (error) {
        console.error("Erro ao buscar avaliações (service):", error);
        throw error.response?.data || new Error("Não foi possível buscar as avaliações");
    }
};

export const criarAvaliacao = async (filmeId, avaliacaoData) => {
    try {
        const response = await api.post(`/filmes/${filmeId}/avaliacoes`, avaliacaoData);

        return response.data;

    } catch (error) {
        console.error("Erro ao salvar avaliação (service):", error);
        throw error.response?.data || new Error("Não foi possível salvar a avaliação");
    }
};

export const deleteAvaliacao = async (filmeId, avaliacaoId) => {
    try {
        await api.delete(`/filmes/${filmeId}/avaliacoes/${avaliacaoId}`);
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        throw error.response?.data || new Error("Não foi possível remover a avaliação");
    }
};

 export const getTodasAvaliacoesAdmin = async () => {
     try {
         const response = await api.get(`/filmes/0/avaliacoes/listar`);
         return Array.isArray(response.data) ? response.data : [];
     } catch (error) {
         console.error("Erro ao buscar todas as avaliações (admin):", error);
         throw error.response?.data || new Error("Não foi possível carregar as avaliações");
     }
 };
