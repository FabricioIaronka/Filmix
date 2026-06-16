import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoBranca from '../../assets/images/logo-white.png';
import {
    HouseDoorFill, Search, Film, PersonCircle,
    TagsFill, GearFill, PeopleFill, ChatQuoteFill,
    BoxArrowRight, List, ChevronLeft
} from 'react-bootstrap-icons';
import { logout } from '../../services/authService';
import './Sidebar.css';

function Sidebar() {
    const navigate = useNavigate();

    // Hook p saber qual a URL atual (ex: "/home")
    const location = useLocation();

    // estado visual: True = menu aberto com textos | False = menu fechado só ícones
    const [isExpanded, setIsExpanded] = useState(true);

    // --- VERIFICAÇÃO DE PERMISSÃO ---
    // lê os dados salvos no Login para saber se mostra a área Admin.
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');

    // Logout: Limpa o token e manda para o login
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    const getLinkClass = (path, isAdminLink = false) => {
        const isActive = location.pathname === path;
        const adminClass = isAdminLink ? 'admin-link' : '';

        return `nav-link d-flex align-items-center ${adminClass} ${isActive ? 'active-link' : ''} ${!isExpanded ? 'justify-content-center' : ''}`;
    };

    return (
        <div className={`sidebar d-flex flex-column ${isExpanded ? 'expanded' : 'collapsed'}`}>

            {/* --- CABEÇALHO DA SIDEBAR --- */}
            <div className="sidebar-header d-flex align-items-center justify-content-between px-3 pt-3 pb-3">
                {isExpanded ? (
                    // se aberto mostra logo completa
                    <img src={logoBranca} alt="Filmix" className="sidebar-logo fade-in" />
                ) : (
                    // Se fechado mostra apenas um F
                    <h4 className="text-danger fw-bold m-0 mx-auto">F</h4>
                )}

                {/* botão de seta para fechar o menu (só aparece se estiver aberto) */}
                {isExpanded && (
                    <button onClick={toggleSidebar} className="btn-toggle text-secondary">
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* botão de hambúrguer para abrir o menu (só aparece se estiver fechado) */}
            {!isExpanded && (
                <div className="text-center mb-3">
                    <button onClick={toggleSidebar} className="btn-toggle text-secondary">
                        <List size={24} />
                    </button>
                </div>
            )}

            {/* --- LINKS DE NAVEGAÇÃO (Menu Principal) --- */}
            <Nav className="flex-column px-2 flex-grow-1">

                {/* título da seção (só aparece se expandido) */}
                {isExpanded && <div className="section-title fade-in">Menu</div>}

                {/* links Comuns (acessíveis a todos) */}
                <Link to="/home" className={getLinkClass('/home')} title="Home">
                    <HouseDoorFill size={20} className={isExpanded ? "me-3" : ""} />
                    {isExpanded && <span className="fade-in">Home</span>}
                </Link>
                <Link to="/explorar" className={getLinkClass('/explorar')} title="Explorar">
                    <Search size={20} className={isExpanded ? "me-3" : ""} />
                    {isExpanded && <span className="fade-in">Explorar</span>}
                </Link>
                <Link to="/meus-filmes" className={getLinkClass('/meus-filmes')} title="Minha Lista">
                    <Film size={20} className={isExpanded ? "me-3" : ""} />
                    {isExpanded && <span className="fade-in">Minha Lista</span>}
                </Link>
                <Link to="/generos" className={getLinkClass('/generos')} title="Gêneros">
                    <TagsFill size={20} className={isExpanded ? "me-3" : ""} />
                    {isExpanded && <span className="fade-in">Gêneros</span>}
                </Link>
                <Link to="/perfil" className={getLinkClass('/perfil')} title="Perfil">
                    <PersonCircle size={20} className={isExpanded ? "me-3" : ""} />
                    {isExpanded && <span className="fade-in">Perfil</span>}
                </Link>

                {/* --- ÁREA ADMINISTRATIVA --- */}
                {/* só renderiza este bloco se isAdmin for verdadeiro */}
                {isAdmin && (
                    <>
                        {isExpanded ? (
                            <>
                                <div className="my-3 border-top border-secondary opacity-25 mx-2"></div>
                                <div className="section-title fade-in text-danger">Admin</div>
                            </>
                        ) : (
                            <div className="my-2 border-top border-secondary opacity-25 mx-2"></div>
                        )}

                        {/* links de Admin (passa true no getLinkClass para mudar a cor) */}
                        <Link to="/admin/filmes" className={getLinkClass('/admin/filmes', true)} title="Adicionar Filmes">
                            <Film size={20} className={isExpanded ? "me-3" : ""} />
                            {isExpanded && <span className="fade-in">Add Filmes</span>}
                        </Link>

                        <Link to="/admin/avaliacoes" className={getLinkClass('/admin/avaliacoes', true)} title="Gerenciar Avaliações">
                            <ChatQuoteFill size={20} className={isExpanded ? "me-3" : ""} />
                            {isExpanded && <span className="fade-in">Avaliações</span>}
                        </Link>

                        <Link to="/admin/generos" className={getLinkClass('/admin/generos', true)} title="Gêneros">
                            <GearFill size={20} className={isExpanded ? "me-3" : ""} />
                            {isExpanded && <span className="fade-in">Gêneros</span>}
                        </Link>

                        <Link to="/admin/usuarios" className={getLinkClass('/admin/usuarios', true)} title="Usuários">
                            <PeopleFill size={20} className={isExpanded ? "me-3" : ""} />
                            {isExpanded && <span className="fade-in">Usuários</span>}
                        </Link>
                    </>
                )}
            </Nav>

            {/* --- RODAPÉ (Perfil Resumido + Logout) --- */}
            <div className="sidebar-footer mt-auto pt-3 border-top border-secondary border-opacity-25 px-3 pb-3">

                {/* mostra avatar e nome do usuário se a barra estiver aberta */}
                {user && isExpanded && (
                    <div className="d-flex align-items-center mb-3 fade-in user-box">
                        <div className="user-avatar">
                            {/* pega a primeira letra do nome */}
                            {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="ms-2 overflow-hidden">
                            <div className="text-white fw-bold text-truncate" style={{fontSize: '0.9rem'}}>{user.nome}</div>
                            <div className="text-secondary small text-uppercase" style={{fontSize: '0.65rem'}}>{isAdmin ? 'Admin' : 'Membro'}</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className={`btn btn-link nav-link text-secondary w-100 d-flex align-items-center hover-white p-0 ${!isExpanded ? 'justify-content-center' : ''}`}
                    title="Sair"
                >
                    <BoxArrowRight size={22} className={isExpanded ? "me-2" : ""} />
                    {isExpanded && <span className="fade-in">Sair</span>}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;