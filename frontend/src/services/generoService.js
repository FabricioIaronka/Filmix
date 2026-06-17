import api from './api';

export const getGeneros = async () => {
    const response = await api.get('/generos');
    return response.data;
};

export const createGenero = async (generoData) => {
    const response = await api.post('/generos', generoData);
    return response.data;
};

export const updateGenero = async (id, generoData) => {
    const response = await api.put(`/generos/${id}`, generoData);
    return response.data;
};

export const deleteGenero = async (id) => {
    const response = await api.delete(`/generos/${id}`);
    return response.data;
};