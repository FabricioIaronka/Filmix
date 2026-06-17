import React, { useState, useEffect, useMemo } from 'react';
import { Button, Spinner, Alert, Modal, Row, Col, Form, InputGroup, Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import { getMinhaLista, removerDaLista, atualizarStatusVisto } from '../../../services/usuarioFilmeService';
import { getGeneros } from '../../../services/generoService';
import { EyeFill, EyeSlashFill, Search, FunnelFill, SortDown, ArrowDown, ArrowUp, ExclamationTriangleFill, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import './MeusFilmesPage.css';
import FilmeDetalhesModal from '../../../components/FilmeDetalhesModal/FilmeDetalhesModal';
import '../../../styles/AdminTheme.css';

function MeusFilmesPage() {
    // --- ESTADOS ---
    const [minhaLista, setMinhaLista] = useState([]); // Lista de objetos { filme: {...}, visto: true/false }
    const [loading, setLoading] = useState(true);

    // Estados de Modais
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Item clicado
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemParaRemover, setItemParaRemover] = useState(null);
    const [saving, setSaving] = useState(false); // Spinner de remoção

    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Filtros e Ordenação
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos'); // 'visto' | 'naoVisto'
    const [filterGenre, setFilterGenre] = useState('todos');
    const [genres, setGenres] = useState([]);
    const [sortBy, setSortBy] = useState('default');
    const [sortDirection, setSortDirection] = useState('asc');

    const showFeedback = (message, variant = 'success') => setToast({ show: true, message, variant });

    // --- CARREGAMENTO ---
    useEffect(() => {
        const carregar = async () => {
            try {
                setLoading(true);
                // Busca Lista Pessoal e Gêneros em paralelo
                const [lista, gen] = await Promise.all([getMinhaLista(), getGeneros()]);
                setMinhaLista(lista);
                setGenres(gen);
            } catch (err) { showFeedback('Erro ao carregar lista.', 'danger'); }
            finally { setLoading(false); }
        };
        carregar();
    }, []);

    // --- AÇÃO: MARCAR COMO VISTO ---
    const handleToggleVisto = async (e, item) => {
        e.stopPropagation(); // IMPORTANTE: Impede que o clique no olho abra o Modal de Detalhes

        const novoStatus = !item.visto; // Inverte o valor atual
        const oldLista = [...minhaLista]; // Backup em caso de erro (Optimistic UI)

        // Atualiza visualmente ANTES de o backend responder (sensação de rapidez)
        setMinhaLista(curr => curr.map(i => i.filme.id === item.filme.id ? { ...i, visto: novoStatus } : i));

        try {
            // Chama API para persistir
            await atualizarStatusVisto(item.filme.id, novoStatus);
        }
        catch (err) {
            showFeedback('Erro ao atualizar status.', 'danger');
            setMinhaLista(oldLista); // Reverte se der erro
        }
    };

    // --- AÇÃO: REMOVER FILME ---
    const handleConfirmarRemocao = async () => {
        if (!itemParaRemover) return;
        setSaving(true);
        try {
            await removerDaLista(itemParaRemover.filme.id);
            showFeedback("Filme removido!", "success");
            setShowDeleteModal(false);
            setItemParaRemover(null);

            // Recarrega a lista para remover o item da tela
            const novaLista = await getMinhaLista();
            setMinhaLista(novaLista);
        } catch (err) { showFeedback('Falha ao remover.', 'danger'); }
        finally { setSaving(false); }
    };

    // --- FILTROS E ORDENAÇÃO (useMemo) ---
    const listaFiltrada = useMemo(() => {
        let lista = [...minhaLista];

        // 1. Filtro Status (Visto / Não Visto)
        if (filterStatus === 'visto') lista = lista.filter(i => i.visto);
        if (filterStatus === 'naoVisto') lista = lista.filter(i => !i.visto);

        // 2. Filtro Gênero
        if (filterGenre !== 'todos') lista = lista.filter(i => i.filme.generos.some(g => (g.id || g) === parseInt(filterGenre)));

        // 3. Busca Texto
        if (searchTerm) lista = lista.filter(i => i.filme.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

        // 4. Ordenação
        if (sortBy === 'alfabetica') {
            lista.sort((a, b) => {
                const A = a.filme.titulo.toLowerCase(); const B = b.filme.titulo.toLowerCase();
                return sortDirection === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
            });
        } else if (sortBy === 'lancamento') {
            lista.sort((a, b) => {
                const A = new Date(a.filme.anoLancamento); const B = new Date(b.filme.anoLancamento);
                return sortDirection === 'asc' ? A - B : B - A;
            });
        }
        return lista;
    }, [minhaLista, filterStatus, filterGenre, searchTerm, sortBy, sortDirection]);

    const isFilterActive = filterStatus !== 'todos' || filterGenre !== 'todos';
    const isSortActive = sortBy !== 'default';

    return (
        <div>
            {/* Notificações */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={4000} autohide className={`cinema-toast border-${toast.variant}`}>
                    <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0"><strong className="me-auto">Filmix</strong></Toast.Header>
                    <Toast.Body className="bg-dark text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Cabeçalho + Filtros */}
            <div className="page-header-container">
                <div>
                    <h1 className="page-title">Meus Filmes</h1>
                    <p className="page-subtitle">Sua coleção pessoal.</p>
                </div>
                <div className="page-controls-container">
                    {/* ... (Mesmos controles da página Explorar: Busca, Dropdown Status, Dropdown Gênero, Sort) ... */}
                    <InputGroup className="control-search">
                        <InputGroup.Text><Search /></InputGroup.Text>
                        <Form.Control placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </InputGroup>

                    <Dropdown onSelect={(key) => { if (key.startsWith('g-')) setFilterGenre(key.split('-')[1]); if (key.startsWith('s-')) setFilterStatus(key.split('-')[1]); }}>
                        <Dropdown.Toggle variant="outline-secondary" className={`control-icon-button ${isFilterActive ? 'active-filter' : ''}`}><FunnelFill /></Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="control-dropdown-menu">
                            <Dropdown.Header>Status</Dropdown.Header>
                            <Dropdown.Item eventKey="s-todos" active={filterStatus === 'todos'}>Todos</Dropdown.Item>
                            <Dropdown.Item eventKey="s-visto" active={filterStatus === 'visto'}>Vistos</Dropdown.Item>
                            <Dropdown.Item eventKey="s-naoVisto" active={filterStatus === 'naoVisto'}>Não Vistos</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Gênero</Dropdown.Header>
                            <Dropdown.Item eventKey="g-todos" active={filterGenre === 'todos'}>Todos</Dropdown.Item>
                            {genres.map(g => (<Dropdown.Item key={g.id} eventKey={`g-${g.id}`} active={filterGenre === g.id.toString()}>{g.nome}</Dropdown.Item>))}
                        </Dropdown.Menu>
                    </Dropdown>
                    {/* ... (Botões de Sort) ... */}
                </div>
            </div>

            {/* Lista de Cards */}
            {loading ? <div className="text-center py-5"><Spinner animation="border" variant="danger"/></div> :
             listaFiltrada.length === 0 ? <div className="empty-state-container"><h4>Nenhum filme encontrado.</h4></div> :
             <Row xs={1} md={2} lg={4} xl={5} className="g-4 film-grid">
                {listaFiltrada.map(item => (
                    <Col key={item.filme.id}>
                        <div className={`film-card ${item.visto ? 'visto' : ''}`} onClick={() => {setSelectedItem(item); setShowDetailModal(true);}}>
                            <div className="film-card-overlay">
                                {/* Botão Olho: Marca como visto sem abrir o modal */}
                                <Button variant="link" className="btn-toggle-visto text-white" onClick={(e) => handleToggleVisto(e, item)}>
                                    {item.visto ? <EyeSlashFill size={20}/> : <EyeFill size={20}/>}
                                </Button>
                            </div>

                            {/* Badge "VISTO" */}
                            {item.visto && <div className="visto-badge">VISTO</div>}

                            <img src={item.filme.fotoFilme || 'https://via.placeholder.com/400'} alt={item.filme.titulo} className="film-card-img"/>
                            <h5 className="film-card-title">{item.filme.titulo}</h5>
                        </div>
                    </Col>
                ))}
             </Row>
            }

            {/* Modal de Detalhes (Reutilizado) */}
            {/* Aqui passamos o botão "Remover" para o footer */}
            <FilmeDetalhesModal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                filme={selectedItem?.filme}
                statusVisto={selectedItem?.visto} // Passa o status para mostrar no modal
                footerBotoes={<Button variant="outline-danger" onClick={() => {setShowDetailModal(false); setItemParaRemover(selectedItem); setShowDeleteModal(true);}}>Remover da Lista</Button>}
            />

            {/* Modal de Confirmação de Remoção */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-dark">
                <Modal.Header closeButton><Modal.Title>Remover Filme</Modal.Title></Modal.Header>
                <Modal.Body className="text-center">
                    <ExclamationTriangleFill size={40} className="text-danger mb-3"/>
                    <p>Deseja remover <strong>{itemParaRemover?.filme.titulo}</strong>?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmarRemocao} disabled={saving}>{saving ? <Spinner size="sm"/> : "Sim, Remover"}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default MeusFilmesPage;