import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // verifica se o token existe no localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // se não houver token, redireciona para a página de login
        return <Navigate to="/login" replace />;
    }

    // se houver token, mostra a página protegida
    return children;
}

export default ProtectedRoute;