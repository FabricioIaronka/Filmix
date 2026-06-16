import axios from 'axios';

const rootUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Cria uma instância "pré-configurada" do axios
const api = axios.create({
    baseURL: `${rootUrl}/api`
});

// Configura o interceptador de pedidos
api.interceptors.request.use(
    (config) => {
        // pega o token do localStorage
        const token = localStorage.getItem('token');

        // se o token existir, adiciona-o ao cabeçalho Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // retorna a configuração do pedido para que ele possa continuar
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;