import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage/LoginPage';
import RegistroPage from './pages/RegistroPage/RegistroPage';

import DashboardPage from './pages/User/DashboardPage/DashboardPage';
import MeusFilmesPage from './pages/User/MeusFilmesPage/MeusFilmesPage';
import GenerosPage from './pages/User/GenerosPage/GenerosPage';
import PerfilPage from './pages/User/PerfilPage/PerfilPage';
import ExplorarPage from './pages/User/ExplorarPage/ExplorarPage';

import AdminGenerosPage from './pages/Admin/AdminGenerosPage/AdminGenerosPage';
import AdminUsuariosPage from './pages/Admin/AdminUsuariosPage/AdminUsuariosPage';
import AdminFilmesPage from './pages/Admin/AdminFilmesPage/AdminFilmesPage';
import AdminAvaliacoesPage from './pages/Admin/AdminAvaliacoesPage/AdminAvaliacoesPage';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';

import './App.css';

const AppLayout = () => (
    <div className="app-layout">
        <Sidebar />
        <main className="main-content">
            <Outlet />
        </main>
    </div>
);

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistroPage />} />

      {/* Rotas Protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/explorar" element={<ExplorarPage />} />
        <Route path="/meus-filmes" element={<MeusFilmesPage />} />
        <Route path="/generos" element={<GenerosPage />} />
        <Route path="/perfil" element={<PerfilPage />} />

        {/* Rotas de Admin */}
        <Route path="/admin/generos" element={<AdminGenerosPage />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        <Route path="/admin/filmes" element={<AdminFilmesPage />} />
        <Route path="/admin/avaliacoes" element={<AdminAvaliacoesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;