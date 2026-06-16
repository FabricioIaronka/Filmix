import React, { useState, useEffect, useMemo } from 'react';
import { Button, Spinner, Alert, Row, Col, Form, InputGroup, Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getFilmes } from '../../../services/filmeService';
import { getGeneros } from '../../../services/generoService';
import { adicionarNaLista } from '../../../services/usuarioFilmeService';
import { Search, SortDown, ArrowDown, ArrowUp, TagsFill, StarFill } from 'react-bootstrap-icons';
import './ExplorarPage.css';
import FilmeDetalhesModal from '../../../components/FilmeDetalhesModal/FilmeDetalhesModal';
import '../../../styles/AdminTheme.css';

function ExplorarPage() {
    // --- ESTADOS ---
    const [todosOsFilmes, setTodosOsFilmes] = useState([]); // Lista completa (Original)
    const [genres, setGenres] = useState([]); // Gêneros para o filtro
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados de Filtro/Ordenação
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('todos');
    const [sortBy, setSortBy] = useState('default');
    const [sortDirection, setSortDirection] = useState('asc');

    // Estados de Modal e Toast
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFilme, setSelectedFilme] = useState(null); // Filme clicado
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Hook para ler a URL (útil se vier de um link externo com ?genero=1)
    const location = useLocation();

    const showFeedback = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- CARREGAMENTO INICIAL ---
    useEffect(() => {
        const carregarPagina = async () => {
            try {
                setLoading(true);
                // Busca Filmes e Gêneros em paralelo para ser rápido
                const [filmesData, generosData] = await Promise.all([getFilmes(), getGeneros()]);
                setTodosOsFilmes(filmesData);
                setGenres(generosData);
                setError('');
            } catch (err) {
                setError('Não foi possível carregar os filmes.');
            } finally {
                setLoading(false);
            }
        };
        carregarPagina();
    }, []);

    // --- SINCRONIA COM URL (Query Params) ---
    // Se a URL for /explorar?genero=5, o filtro seleciona o gênero 5 automaticamente
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const genreIdFromUrl = params.get('genero');
        if (genreIdFromUrl) setFilterGenre(genreIdFromUrl);
    }, [location.search]);

    // --- LÓGICA DE FILTRAGEM (useMemo) ---
    // Recalcula a lista visível apenas se os filtros mudarem
    const listaFiltradaEOrdenada = useMemo(() => {
        let lista = [...todosOsFilmes]; // Cópia para não estragar a original

        // 1. Filtro por Gênero
        if (filterGenre !== 'todos') {
            lista = lista.filter(filme => filme.generos.some(g => (g.id || g) === parseInt(filterGenre)));
        }

        // 2. Filtro por Busca (Título)
        if (searchTerm) {
            lista = lista.filter(filme => filme.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // 3. Ordenação
        if (sortBy === 'alfabetica') {
            lista.sort((a, b) => {
                const A = a.titulo.toLowerCase(); const B = b.titulo.toLowerCase();
                return sortDirection === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
            });
        } else if (sortBy === 'lancamento') {
            lista.sort((a, b) => {
                const A = new Date(a.anoLancamento); const B = new Date(b.anoLancamento);
                return sortDirection === 'asc' ? A - B : B - A;
            });
        }
        return lista;
    }, [todosOsFilmes, filterGenre, searchTerm, sortBy, sortDirection]);

    const handleToggleSortDirection = () => setSortDirection(dir => (dir === 'asc' ? 'desc' : 'asc'));

    // --- AÇÃO: ADICIONAR À LISTA ---
    const handleAdicionarLista = async (filmeId) => {
        try {
            await adicionarNaLista(filmeId);
            showFeedback("Filme adicionado à sua lista!", "success");
            setShowDetailModal(false); // Fecha modal após adicionar
        } catch (error) {
            // Tratamento inteligente: Se já estiver na lista (409 Conflict), mostra aviso amarelo
            const msg = error.response?.data || "Erro ao adicionar.";
            const variant = msg.includes("já está") ? "warning" : "danger";
            showFeedback(msg, variant);
        }
    };

    // Abre o modal de detalhes
    const handleAbrirDetalhes = (filme) => { setSelectedFilme(filme); setShowDetailModal(true); };
    const handleCloseDetalhes = () => { setShowDetailModal(false); setSelectedFilme(null); };

    // Renderiza o grid de filmes ou mensagens de estado
    const renderContent = () => {
        if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
        if (error) return <Alert variant="danger">{error}</Alert>;
        if (listaFiltradaEOrdenada.length === 0) return <div className="empty-state-container"><h4>Nenhum filme encontrado.</h4></div>;

        return (
            // Grid Responsivo: 1 col (cel), 2 (tablet), 4 (pc), 5 (tela grande)
            <Row xs={1} md={2} lg={4} xl={5} className="g-4 film-grid">
                {listaFiltradaEOrdenada.map(filme => (
                    <Col key={filme.id}>
                        {/* CARD DO FILME (Clicável) */}
                        <div className="film-card" onClick={() => handleAbrirDetalhes(filme)}>
                            <div className="film-card-overlay"></div>

                            {/* Badge de Nota Média (só aparece se tiver nota) */}
                            {filme.mediaNota > 0 && (
                                <div className="card-rating-badge"><StarFill size={10} className="me-1 mb-1"/>{filme.mediaNota.toFixed(1)}</div>
                            )}

                            {/* Imagem da Capa */}
                            <img src={filme.fotoFilme || 'https://via.placeholder.com/400x600'} alt={filme.titulo} className="film-card-img"/>
                            <h5 className="film-card-title">{filme.titulo}</h5>
                        </div>
                    </Col>
                ))}
            </Row>
        );
    };

    // Variáveis auxiliares de estilo
    const isFilterActive = filterGenre !== 'todos';
    const isSortActive = sortBy !== 'default';

    return (
        <div className="explorar-page-container">
            {/* Notificações */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={4000} autohide className={`cinema-toast border-${toast.variant}`}>
                    <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0"><strong className="me-auto">Filmix</strong></Toast.Header>
                    <Toast.Body className="bg-dark text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Header + Controles */}
            <div className="page-header-container">
                <div>
                    <h1 className="page-title">Explorar Filmes</h1>
                    <p className="page-subtitle">Descubra novos títulos.</p>
                </div>

                <div className="page-controls-container">
                    {/* Barra de Pesquisa */}
                    <InputGroup className="control-search">
                        <InputGroup.Text><Search /></InputGroup.Text>
                        <Form.Control placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </InputGroup>

                    {/* Filtro por Gênero */}
                    <Dropdown onSelect={(key) => setFilterGenre(key)}>
                        <Dropdown.Toggle variant="outline-secondary" className={`control-icon-button ${isFilterActive ? 'active-filter' : ''}`}>
                            <TagsFill />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="control-dropdown-menu">
                            <Dropdown.Header>Filtrar por Gênero</Dropdown.Header>
                            <Dropdown.Item eventKey="todos" active={filterGenre === 'todos'}>Todos</Dropdown.Item>
                            {genres.map(genre => (<Dropdown.Item key={genre.id} eventKey={genre.id.toString()} active={filterGenre === genre.id.toString()}>{genre.nome}</Dropdown.Item>))}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Ordenação */}
                    <Dropdown onSelect={(key) => setSortBy(key)}>
                        <Dropdown.Toggle variant="outline-secondary" className={`control-icon-button ${isSortActive ? 'active-filter' : ''}`}>
                            <SortDown />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="control-dropdown-menu">
                            <Dropdown.Header>Ordenar Por</Dropdown.Header>
                            <Dropdown.Item eventKey="default" active={sortBy === 'default'}>Padrão</Dropdown.Item>
                            <Dropdown.Item eventKey="alfabetica" active={sortBy === 'alfabetica'}>A-Z</Dropdown.Item>
                            <Dropdown.Item eventKey="lancamento" active={sortBy === 'lancamento'}>Lançamento</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Button variant="outline-secondary" className="control-icon-button" onClick={handleToggleSortDirection}>
                        {sortDirection === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                </div>
            </div>

            {/* Lista de Filmes */}
            {renderContent()}

            {/* Modal de Detalhes (só abre se selectedFilme existir) */}
            {selectedFilme && (
                <FilmeDetalhesModal
                    show={showDetailModal}
                    onHide={handleCloseDetalhes}
                    filme={selectedFilme}
                    // Passa o botão personalizado para o footer do modal
                    footerBotoes={<Button variant="danger" onClick={() => handleAdicionarLista(selectedFilme.id)}>+ Minha Lista</Button>}
                />
            )}
        </div>
    );
}

export default ExplorarPage;