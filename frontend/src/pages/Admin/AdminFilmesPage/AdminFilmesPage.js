import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Row, Col, Badge, Table, Spinner, Modal, Toast, ToastContainer, InputGroup, Dropdown } from 'react-bootstrap';
import { PencilSquare, Trash, CheckCircleFill, XCircleFill, ExclamationTriangleFill, Film, Search, FunnelFill, SortDown, ArrowUp, ArrowDown } from 'react-bootstrap-icons';
import { getGeneros } from '../../../services/generoService';
import { getFilmes } from '../../../services/filmeService';
import api from '../../../services/api'; // Axios configurado
import '../../../styles/AdminTheme.css';

function AdminFilmesPage() {

    // --- ESTADOS DE DADOS ---
    const [generos, setGeneros] = useState([]); // Lista de gêneros para o select
    const [filmes, setFilmes] = useState([]);   // Lista de filmes para a tabela

    // --- ESTADOS DO FORMULÁRIO ---
    // Objeto único que guarda todos os campos do formulário
    const [formData, setFormData] = useState({
        titulo: '', sinopse: '', diretor: '', anoLancamento: '', fotoFilme: '', generoIds: []
    });

    // Se editingId for null, estamos CRIANDO. Se tiver um número, estamos EDITANDO.
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false); // Spinner do botão salvar
    const [loadingList, setLoadingList] = useState(true); // Spinner da tabela

    // --- ESTADOS DE FILTRO E ORDENAÇÃO ---
    const [filterTitle, setFilterTitle] = useState('');
    const [filterGenre, setFilterGenre] = useState('todos');
    const [sortField, setSortField] = useState('default');
    const [sortDir, setSortDir] = useState('asc');

    // --- ESTADOS DE UI (Modal e Toast) ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [filmeToDelete, setFilmeToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Helper para exibir notificações
    const showFeedback = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // Roda apenas uma vez ao abrir a página
    useEffect(() => { loadData(); }, []);

    // Busca dados iniciais
    const loadData = async () => {
        setLoadingList(true);
        try {
            // Promise.all: Busca gêneros e filmes ao mesmo tempo (Paralelismo)
            // Isso faz a página carregar mais rápido do que esperar um terminar para chamar o outro
            const [genData, filmesData] = await Promise.all([
                getGeneros(),
                getFilmes()
            ]);
            setGeneros(genData);
            setFilmes(filmesData);
        } catch (error) {
            console.error(error);
            showFeedback("Erro ao carregar dados.", "danger");
        } finally {
            setLoadingList(false);
        }
    };

    // --- LÓGICA DE SALVAR (CREATE / UPDATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita recarregar a página
        setSaving(true);

        // Validação manual: O filme precisa ter pelo menos 1 gênero
        if (!formData.generoIds || formData.generoIds.length === 0) {
            showFeedback('Selecione pelo menos um gênero.', 'warning');
            setSaving(false);
            return;
        }

        try {
            if (editingId) {
                // PUT: Atualiza filme existente
                await api.put(`/filmes/${editingId}`, formData);
                showFeedback("Filme atualizado com sucesso!");
            } else {
                // POST: Cria novo filme
                await api.post('/filmes', formData);
                showFeedback("Filme adicionado com sucesso!");
            }
            resetForm(); // Limpa o formulário
            loadData();  // Recarrega a tabela para mostrar o dado novo
        } catch (error) {
            showFeedback('Erro ao salvar filme.', 'danger');
        } finally {
            setSaving(false);
        }
    };

    // Reseta o formulário para o estado inicial (limpo)
    const resetForm = () => {
        setFormData({ titulo: '', sinopse: '', diretor: '', anoLancamento: '', fotoFilme: '', generoIds: [] });
        setEditingId(null); // Volta para modo "Criação"
    };

    // Prepara o formulário para EDIÇÃO
    const handleEdit = (filme) => {
        // Extrai apenas os IDs dos gêneros (o backend manda objetos completos, mas o form só quer IDs)
        const idsGeneros = filme.generos ? filme.generos.map(g => g.id) : [];

        setFormData({
            titulo: filme.titulo,
            sinopse: filme.sinopse,
            diretor: filme.diretor,
            // Formata a data para YYYY-MM-DD (necessário para o input type="date")
            anoLancamento: filme.anoLancamento ? filme.anoLancamento.split('T')[0] : '',
            fotoFilme: filme.fotoFilme,
            generoIds: idsGeneros
        });
        setEditingId(filme.id); // Ativa modo "Edição"
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página para o topo (onde está o form)
    };

    // --- LÓGICA DE DELETAR ---
    const openDeleteModal = (filme) => {
        setFilmeToDelete(filme);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!filmeToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/filmes/${filmeToDelete.id}`);
            showFeedback("Filme excluído com sucesso.");
            setShowDeleteModal(false);
            setFilmeToDelete(null);
            loadData();
        } catch (error) {
            showFeedback("Erro ao excluir filme.", "danger");
        } finally {
            setDeleting(false);
        }
    };

    // --- LÓGICA DE SELEÇÃO MÚLTIPLA DE GÊNEROS ---
    const toggleGenero = (id) => {
        // Se o ID já está na lista, remove (filter). Se não está, adiciona (...spread).
        const ids = formData.generoIds.includes(id)
            ? formData.generoIds.filter(gId => gId !== id)
            : [...formData.generoIds, id];
        setFormData({...formData, generoIds: ids});
    };

    // --- FILTROS E ORDENAÇÃO (CLIENT-SIDE) ---
    const listaFiltrada = useMemo(() => {
        let lista = [...filmes];

        // 1. Filtro por Título
        if (filterTitle.trim()) {
            lista = lista.filter(f => f.titulo.toLowerCase().includes(filterTitle.toLowerCase()));
        }

        // 2. Filtro por Gênero
        if (filterGenre !== 'todos') {
            // Verifica se o filme tem algum gênero cujo ID bate com o filtro
            lista = lista.filter(f => f.generos.some(g => String(g.id) === filterGenre));
        }

        // 3. Ordenação
        if (sortField !== 'default') {
            lista.sort((a, b) => {
                let valA, valB;
                if (sortField === 'titulo') {
                    valA = a.titulo.toLowerCase(); valB = b.titulo.toLowerCase();
                } else if (sortField === 'ano') {
                    valA = a.anoLancamento; valB = b.anoLancamento;
                } else if (sortField === 'diretor') {
                    valA = a.diretor.toLowerCase(); valB = b.diretor.toLowerCase();
                }

                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return lista;
    }, [filmes, filterTitle, filterGenre, sortField, sortDir]); // Recalcula se algo mudar

    const toggleSort = (field) => {
        if (sortField !== field) { setSortField(field); setSortDir('asc'); }
        else { if (sortDir === 'asc') setSortDir('desc'); else { setSortField('default'); setSortDir('asc'); } }
    };

    // Variáveis auxiliares para estilização dos botões de filtro
    const isFilterActive = filterGenre !== 'todos';
    const isSortActive = sortField !== 'default';

    return (
        <div className="admin-container">
            {/* Componente de Notificação */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={4000} autohide className={`cinema-toast border-${toast.variant}`}>
                    <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0">
                        {toast.variant === 'success' ? <CheckCircleFill className="text-success me-2"/> : <XCircleFill className="text-danger me-2"/>}
                        <strong className="me-auto">Admin</strong>
                    </Toast.Header>
                    <Toast.Body className="bg-dark text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Cabeçalho da Página */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="page-title text-danger">
                    {/* Título Dinâmico: muda se for Editar ou Adicionar */}
                    {editingId ? 'Editar Filme' : 'Adicionar Filme'}
                </h2>
                {editingId && (
                    <Button variant="outline-secondary" onClick={resetForm}>Cancelar Edição</Button>
                )}
            </div>

            {/* --- FORMULÁRIO DE CADASTRO/EDIÇÃO --- */}
            <Form onSubmit={handleSubmit} className="mb-5">
                <Row>
                    {/* Coluna da Esquerda: Dados de Texto */}
                    <Col md={8}>
                        <div className="p-4 mb-4 rounded" style={{backgroundColor: '#1f1f1f', border: '1px solid #333'}}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white fw-bold">Título do Filme</Form.Label>
                                <Form.Control className="form-control-dark" value={formData.titulo} onChange={e=>setFormData({...formData, titulo: e.target.value})} required />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Diretor</Form.Label>
                                        <Form.Control className="form-control-dark" value={formData.diretor} onChange={e=>setFormData({...formData, diretor: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Data de Lançamento</Form.Label>
                                        <Form.Control type="date" className="form-control-dark" value={formData.anoLancamento} onChange={e=>setFormData({...formData, anoLancamento: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label className="text-light">Sinopse</Form.Label>
                                <Form.Control as="textarea" rows={4} className="form-control-dark" value={formData.sinopse} onChange={e=>setFormData({...formData, sinopse: e.target.value})} required />
                            </Form.Group>
                        </div>

                        {/* Seletor de Gêneros (Badges clicáveis) */}
                        <div className="p-4 mb-3 rounded" style={{backgroundColor: '#1f1f1f', border: '1px solid #333'}}>
                            <Form.Label className="d-block mb-3 text-warning fw-bold">Gêneros (Clique para selecionar)</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {generos.map(g => (
                                    <Badge
                                        key={g.id}
                                        // Muda a cor se estiver selecionado
                                        bg={formData.generoIds.includes(g.id) ? 'danger' : 'secondary'}
                                        style={{cursor: 'pointer', fontSize: '0.9rem', padding: '10px 15px', border: formData.generoIds.includes(g.id) ? '2px solid #fff' : '1px solid transparent', transition: 'all 0.2s'}}
                                        onClick={() => toggleGenero(g.id)}
                                    >
                                        {g.nome}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Coluna da Direita: URL da Foto e Preview */}
                    <Col md={4}>
                        <div className="p-4 h-100 rounded text-center" style={{backgroundColor: '#1f1f1f', border: '1px solid #333'}}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white fw-bold">URL da Capa</Form.Label>
                                <Form.Control className="form-control-dark" placeholder="https://..." value={formData.fotoFilme} onChange={e=>setFormData({...formData, fotoFilme: e.target.value})} />
                            </Form.Group>

                            {/* Caixa de Preview da Imagem */}
                            <div className="mt-4 d-flex align-items-center justify-content-center rounded border border-secondary bg-black" style={{minHeight: '350px', overflow: 'hidden'}}>
                                {formData.fotoFilme ? (
                                    <img src={formData.fotoFilme} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} onError={(e)=>{e.target.style.display='none'}}/>
                                ) : (
                                    <div className="text-secondary"><Film size={30} className="mb-2"/><p>Preview da Capa</p></div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Botão de Salvar (muda texto e cor se for Edição) */}
                <Button type="submit" variant={editingId ? "warning" : "danger"} size="lg" className="mt-3 w-100 fw-bold py-3" disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border"/> : (editingId ? 'ATUALIZAR FILME' : 'SALVAR NO CATÁLOGO')}
                </Button>
            </Form>

            <hr className="border-secondary my-5" />

            {/* --- BARRA DE FERRAMENTAS DA TABELA --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <h3 className="text-white m-0">Gerenciar Catálogo</h3>

                <div className="page-controls-container">
                    {/* Campo de Busca */}
                    <InputGroup className="control-search" size="sm">
                        <InputGroup.Text className="bg-dark border-secondary text-secondary"><Search/></InputGroup.Text>
                        <Form.Control placeholder="Buscar filme..." value={filterTitle} onChange={e => setFilterTitle(e.target.value)} className="bg-dark text-white border-secondary"/>
                    </InputGroup>

                    {/* Filtro por Gênero (Dropdown) */}
                    <Dropdown onSelect={(key) => setFilterGenre(key)}>
                        <Dropdown.Toggle variant="outline-secondary" className={`control-icon-button ${isFilterActive ? 'active-filter' : ''}`} title="Filtrar por Gênero">
                            <FunnelFill />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" className="control-dropdown-menu">
                            <Dropdown.Header>Filtrar por Gênero</Dropdown.Header>
                            <Dropdown.Item eventKey="todos" active={filterGenre === 'todos'}>Todos</Dropdown.Item>
                            {generos.map(g => (
                                <Dropdown.Item key={g.id} eventKey={String(g.id)} active={filterGenre === String(g.id)}>{g.nome}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Ordenação */}
                    <Dropdown onSelect={(key) => toggleSort(key)}>
                        <Dropdown.Toggle variant="outline-secondary" className={`control-icon-button ${isSortActive ? 'active-filter' : ''}`} title="Ordenar">
                            <SortDown />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" className="control-dropdown-menu">
                            <Dropdown.Header>Ordenar Por</Dropdown.Header>
                            <Dropdown.Item eventKey="titulo" active={sortField === 'titulo'}>Título {sortField === 'titulo' && (sortDir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}</Dropdown.Item>
                            <Dropdown.Item eventKey="ano" active={sortField === 'ano'}>Ano {sortField === 'ano' && (sortDir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}</Dropdown.Item>
                            <Dropdown.Item eventKey="diretor" active={sortField === 'diretor'}>Diretor {sortField === 'diretor' && (sortDir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Botão para inverter ordem (Asc/Desc) */}
                    <Button variant="outline-secondary" className="control-icon-button" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
                        {sortDir === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                </div>
            </div>

            {/* --- TABELA DE FILMES --- */}
            {loadingList ? <div className="text-center"><Spinner animation="border" variant="danger" /></div> : (
                <div className="table-responsive">
                    <Table className="table-cinema align-middle" hover>
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}>Capa</th>
                                <th>Título</th>
                                <th>Diretor</th>
                                <th>Ano</th>
                                <th>Gêneros</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaFiltrada.map(f => (
                                <tr key={f.id}>
                                    <td>
                                        <img src={f.fotoFilme} alt="" style={{width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} onError={(e) => e.target.style.display='none'} />
                                    </td>
                                    <td className="fw-bold text-white">{f.titulo}</td>
                                    <td className="text-muted">{f.diretor}</td>
                                    {/* Mostra apenas o ano (YYYY) */}
                                    <td>{f.anoLancamento ? f.anoLancamento.split('-')[0] : '-'}</td>
                                    <td>
                                        {/* Lista os gêneros do filme */}
                                        {f.generos && f.generos.map(g => (
                                            <Badge key={g.id} bg="secondary" className="me-1" style={{fontSize: '0.7rem'}}>{g.nome}</Badge>
                                        ))}
                                    </td>
                                    <td className="text-end">
                                        {/* Botão de Editar (Carrega dados no form) */}
                                        <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEdit(f)} title="Editar">
                                            <PencilSquare />
                                        </Button>
                                        {/* Botão de Excluir (Abre Modal) */}
                                        <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(f)} title="Excluir">
                                            <Trash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {listaFiltrada.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhum filme encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-dark">
                <Modal.Header closeButton><Modal.Title className="text-white">Excluir Filme</Modal.Title></Modal.Header>
                <Modal.Body className="text-center">
                    <ExclamationTriangleFill size={40} className="text-danger mb-3" />
                    <p className="text-white">Tem certeza que deseja excluir o filme?</p>
                    <h4 className="text-white fw-bold mb-3">{filmeToDelete?.titulo}</h4>
                    <p className="text-muted small">Esta ação é irreversível.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>{deleting ? <Spinner size="sm"/> : "Sim, Excluir"}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminFilmesPage;