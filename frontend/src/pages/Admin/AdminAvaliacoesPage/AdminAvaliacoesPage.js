import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, Button, Badge, Spinner, Form, InputGroup, Dropdown, Modal, Toast, ToastContainer
} from 'react-bootstrap';
import api from '../../../services/api';
import { getTodasAvaliacoesAdmin } from '../../../services/avaliacaoService';
import { getTodosUsuarios } from '../../../services/usuarioService';
import { Trash, StarFill, FunnelFill, SortDown, ExclamationTriangleFill, CheckCircleFill, XCircleFill, Film } from 'react-bootstrap-icons';
import '../../../styles/AdminTheme.css';
import './AdminAvaliacoesPage.css';

function AdminAvaliacoesPage() {
  // --- ESTADOS DE DADOS ---
  const [avaliacoes, setAvaliacoes] = useState([]); // Lista bruta do banco
  const [usuarios, setUsuarios] = useState([]); // Lista de usuários para o filtro
  const [loading, setLoading] = useState(true); // Carregamento inicial

  // --- ESTADOS DE UI (Modal e Toast) ---
  const [showModal, setShowModal] = useState(false); // Abre/fecha modal de excluir
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState(null); // Qual avaliação será excluída
  const [deleting, setDeleting] = useState(false); // Spinner do botão de excluir
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' }); // Notificações

  // --- ESTADOS DE FILTRO E ORDENAÇÃO ---
  const [filtroFilme, setFiltroFilme] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [notaMin, setNotaMin] = useState('');
  const [notaMax, setNotaMax] = useState('');
  const [sortField, setSortField] = useState(''); // Campo atual de ordenação
  const [sortDir, setSortDir] = useState('asc'); // Direção (asc/desc)

  // Função auxiliar para mostrar notificações (Toast)
  const showFeedback = (message, variant = 'success') => {
      setToast({ show: true, message, variant });
  };

  // Carrega os dados ao abrir a página
  const load = async () => {
    try {
      setLoading(true);
      // Promise.all: Faz as duas requisições ao mesmo tempo (paralelo) para ser mais rápido
      const [lista, listaUsuarios] = await Promise.all([
        getTodasAvaliacoesAdmin(),
        getTodosUsuarios()
      ]);
      setAvaliacoes(Array.isArray(lista) ? lista : []);
      setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
    } catch (e) {
      showFeedback('Erro ao carregar dados.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // --- LÓGICA DE EXCLUSÃO ---
  const openDeleteModal = (avaliacao) => {
      setAvaliacaoToDelete(avaliacao);
      setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!avaliacaoToDelete) return;
    setDeleting(true);

    try {
        const filmeId = avaliacaoToDelete.filme?.id || avaliacaoToDelete.filmeId;

        // Verifica se tem ID do filme para montar a rota correta da API
        if (filmeId) {
             await api.delete(`/filmes/${filmeId}/avaliacoes/${avaliacaoToDelete.id}`);
        } else {
             await api.delete(`/avaliacoes/${avaliacaoToDelete.id}`);
        }

        showFeedback("Avaliação excluída com sucesso!");
        setShowModal(false);
        setAvaliacaoToDelete(null);
        load(); // Recarrega a tabela para sumir com o item excluído
    } catch (e) {
        showFeedback('Erro ao apagar avaliação.', 'danger');
    } finally {
        setDeleting(false);
    }
  };

  // O useMemo garante que essa lógica pesada só rode quando um dos filtros mudar
  const listaFiltrada = useMemo(() => {
    let lista = [...avaliacoes]; // Cria uma cópia para não alterar o original

    // 1. Filtro por Nome do Filme
    if (filtroFilme.trim()) lista = lista.filter(a => (a.filme?.titulo || '').toLowerCase().includes(filtroFilme.toLowerCase()));

    // 2. Filtro por Usuário (Select)
    if (filtroUsuario) lista = lista.filter(a => String(a.nomeUsuario?.id || a.usuario?.id) === String(filtroUsuario));

    // 3. Filtro por Nota (Min/Max)
    if (notaMin !== '') lista = lista.filter(a => a.nota >= Number(notaMin));
    if (notaMax !== '') lista = lista.filter(a => a.nota <= Number(notaMax));

    // 4. Ordenação (Sort)
    if (sortField) {
      lista.sort((a, b) => {
        let A, B;
        // Define o que comparar baseado no campo escolhido
        if (sortField === 'nota') { A = a.nota ?? 0; B = b.nota ?? 0; }
        else if (sortField === 'filme') { A = (a.filme?.titulo || '').toLowerCase(); B = (b.filme?.titulo || '').toLowerCase(); }
        else if (sortField === 'usuario') { A = (a.nomeUsuario?.nome || a.usuario?.nome || '').toLowerCase(); B = (b.nomeUsuario?.nome || b.usuario?.nome || '').toLowerCase(); }

        // Compara Strings ou Números
        if (typeof A === 'string') return sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
        return sortDir === 'asc' ? A - B : B - A;
      });
    }
    return lista;
  }, [avaliacoes, filtroFilme, filtroUsuario, notaMin, notaMax, sortField, sortDir]);

  // Alterna a ordenação ao clicar no menu
  const toggleSort = (field) => {
    if (sortField !== field) { setSortField(field); setSortDir('asc'); }
    else { if (sortDir === 'asc') setSortDir('desc'); else { setSortField(''); setSortDir('asc'); } }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="admin-container">
      {/* Toast de Notificação (Canto superior direito) */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
        <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={4000} autohide className={`cinema-toast border-${toast.variant}`}>
          <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0">
            {toast.variant === 'success' ? <CheckCircleFill className="text-success me-2"/> : <XCircleFill className="text-danger me-2"/>}
            <strong className="me-auto">{toast.variant === 'success' ? 'Sucesso' : 'Erro'}</strong>
          </Toast.Header>
          <Toast.Body className="bg-dark text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Cabeçalho e Filtros */}
      <div className="page-header-container">
        <div><h2 className="page-title">Gerenciar Avaliações</h2></div>
        <div className="page-controls-container">
          {/* Busca por Texto */}
          <InputGroup className="control-search" size="sm">
            <Form.Control placeholder="Buscar filme..." value={filtroFilme} onChange={e => setFiltroFilme(e.target.value)} />
          </InputGroup>

          {/* Select de Usuários */}
          <Form.Select size="sm" value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} className="control-select">
            <option value="">Todos os usuários</option>
            {usuarios.map(u => (<option key={u.id} value={u.id}>{u.nome}</option>))}
          </Form.Select>

          {/* Dropdown de Filtro Avançado (Nota) */}
          <Dropdown className="control-dropdown">
            <Dropdown.Toggle className={`control-icon-button ${ (notaMin || notaMax) ? 'active-filter' : '' }`} variant="outline-secondary"><FunnelFill /></Dropdown.Toggle>
            <Dropdown.Menu className="control-dropdown-menu">
              <div className="px-3 py-2">
                <div className="text-muted small mb-2">Filtrar por nota</div>
                <div className="d-flex gap-2">
                  <Form.Control placeholder="Min" size="sm" type="number" min="0" max="10" step="0.5" value={notaMin} onChange={e => setNotaMin(e.target.value)} />
                  <Form.Control placeholder="Max" size="sm" type="number" min="0" max="10" step="0.5" value={notaMax} onChange={e => setNotaMax(e.target.value)} />
                </div>
                <div className="mt-2 d-flex justify-content-end gap-2"><Button size="sm" variant="outline-light" onClick={() => { setNotaMin(''); setNotaMax(''); }}>Limpar</Button></div>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* Dropdown de Ordenação */}
          <Dropdown className="control-dropdown">
            <Dropdown.Toggle className={`control-icon-button ${sortField ? 'active-filter' : ''}`} variant="outline-secondary"><SortDown /></Dropdown.Toggle>
            <Dropdown.Menu className="control-dropdown-menu">
              <Dropdown.Header>Ordenar Por</Dropdown.Header>
              <Dropdown.Item onClick={() => toggleSort('filme')} active={sortField === 'filme'}>Filme {sortField === 'filme' && (sortDir === 'asc' ? '↑' : '↓')}</Dropdown.Item>
              <Dropdown.Item onClick={() => toggleSort('usuario')} active={sortField === 'usuario'}>Usuário {sortField === 'usuario' && (sortDir === 'asc' ? '↑' : '↓')}</Dropdown.Item>
              <Dropdown.Item onClick={() => toggleSort('nota')} active={sortField === 'nota'}>Nota {sortField === 'nota' && (sortDir === 'asc' ? '↑' : '↓')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Tabela de Dados */}
      {loading ? <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div> : (
        <div className="table-responsive">
          <Table className="table-cinema align-middle">
            <thead>
                <tr>
                    <th style={{width: '60px'}}>Capa</th>
                    <th>Filme</th>
                    <th>Usuário</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                    <th className="text-end">Ação</th>
                </tr>
            </thead>
            <tbody>
              {listaFiltrada.map(av => (
                <tr key={av.id}>
                  {/* Coluna da Imagem (com fallback se der erro) */}
                  <td>
                      {av.filme?.fotoFilme ? (
                          <img
                            src={av.filme.fotoFilme}
                            alt="Capa"
                            style={{width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}
                            onError={(e) => e.target.style.display='none'}
                          />
                      ) : (
                          <div className="text-secondary text-center" style={{width: '40px'}}><Film size={20}/></div>
                      )}
                  </td>

                  <td className="text-danger fw-bold">{av.filme?.titulo || 'Filme removido'}</td>
                  <td>{av.nomeUsuario?.nome || av.usuario?.nome || 'Anônimo'}</td>
                  <td><Badge bg="warning" text="dark"><StarFill size={12} className="me-1" /> {av.nota}</Badge></td>
                  <td className="text-muted small">"{av.comentario}"</td>
                  <td className="text-end">
                    <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(av)}><Trash /></Button>
                  </td>
                </tr>
              ))}
              {/* Mensagem se não houver dados */}
              {listaFiltrada.length === 0 && <tr><td colSpan="6" className="text-center p-4 text-muted">Nenhuma avaliação encontrada.</td></tr>}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-dark">
        <Modal.Header closeButton><Modal.Title className="text-white">Excluir Avaliação</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
            <ExclamationTriangleFill size={40} className="text-danger mb-3" />
            <p className="text-white">Tem certeza que deseja apagar esta avaliação?</p>
            {avaliacaoToDelete && (
                <div className="p-2 rounded bg-dark border border-secondary text-start mx-auto text-muted small" style={{maxWidth: '90%'}}>
                    <strong>Filme:</strong> {avaliacaoToDelete.filme?.titulo}<br/>
                    <strong>Comentário:</strong> "{avaliacaoToDelete.comentario}"
                </div>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>{deleting ? <Spinner size="sm"/> : "Confirmar Exclusão"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminAvaliacoesPage;