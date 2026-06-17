import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Badge, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { getTodosUsuarios, updateUsuarioRole } from '../../../services/usuarioService';
import { ShieldLockFill, PersonFill, PencilSquare, ExclamationTriangleFill, PersonCircle, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import '../../../styles/AdminTheme.css';

function AdminUsuariosPage() {
    // --- ESTADOS ---
    const [usuarios, setUsuarios] = useState([]); // Lista de usuários vinda do backend
    const [loading, setLoading] = useState(true); // Controle de carregamento inicial

    // Estados do Modal e Toast
    const [showModal, setShowModal] = useState(false); // Abre/fecha modal de confirmação
    const [selectedUser, setSelectedUser] = useState(null); // Qual usuário será editado
    const [updating, setUpdating] = useState(false); // Spinner do botão "Confirmar"
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' }); // Notificações

    // Helper para exibir feedback visual
    const showFeedback = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- CARREGAMENTO DE DADOS ---
    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await getTodosUsuarios();
            // Garante que 'lista' seja um array, mesmo se o backend mandar paginado
            let lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
            setUsuarios(lista);
        } catch (err) {
            showFeedback('Erro ao carregar lista de usuários.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Roda ao abrir a página
    useEffect(() => { loadUsuarios(); }, []);

    // --- LÓGICA DE ALTERAÇÃO DE PERMISSÃO (ROLE) ---

    // Abre o modal e guarda o usuário alvo
    const handleOpenModal = (usuario) => {
        setSelectedUser(usuario);
        setShowModal(true);
    };

    // Confirma a ação no Backend
    const handleConfirmChange = async () => {
        if (!selectedUser) return;
        setUpdating(true); // Ativa spinner

        // Lógica de Troca: Se é ADMIN vira USER, se é USER vira ADMIN
        const novoRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';

        try {
            // Chama a API para atualizar no banco
            await updateUsuarioRole(selectedUser.id, novoRole);

            setShowModal(false);
            showFeedback(`Permissão de ${selectedUser.nome} alterada com sucesso!`, 'success');
            await loadUsuarios(); // Recarrega a lista para mostrar o novo cargo
        } catch (err) {
            showFeedback("Erro ao mudar permissão.", "danger");
        } finally {
            setUpdating(false);
            setSelectedUser(null);
        }
    };

    // --- RENDERIZAÇÃO (JSX) ---
    return (
        <div className="admin-container">
            {/* Componente Toast (Notificações) */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={4000} autohide className={`cinema-toast border-${toast.variant}`}>
                    <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0">
                        {toast.variant === 'success' ? <CheckCircleFill className="text-success me-2"/> : <XCircleFill className="text-danger me-2"/>}
                        <strong className="me-auto">{toast.variant === 'success' ? 'Sucesso' : 'Erro'}</strong>
                    </Toast.Header>
                    <Toast.Body className="bg-dark text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-title">Gerenciar Usuários</h2>
                    <p className="page-subtitle">Controle quem tem acesso administrativo.</p>
                </div>
                <Button variant="outline-light" onClick={loadUsuarios}>Atualizar Lista</Button>
            </div>

            {/* Tabela de Usuários */}
            {loading ? <Spinner animation="border" variant="danger" /> : (
                <div className="table-responsive">
                    <Table className="table-cinema align-middle" hover>
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}></th> {/* Coluna Avatar */}
                                <th>Nome</th>
                                <th>Email</th>
                                <th className="text-center">Cargo Atual</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    {/* Avatar com Fallback */}
                                    <td className="text-center">
                                        {u.fotoPerfil ? (
                                            <img
                                                src={u.fotoPerfil}
                                                alt={u.nome}
                                                className="user-avatar-small"
                                                // Se a imagem falhar, esconde ela e mostra o ícone
                                                onError={(e) => {e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex';}}
                                            />
                                        ) : null}
                                        {/* Placeholder (Ícone) padrão se não tiver foto */}
                                        <div className="user-avatar-placeholder mx-auto" style={{display: u.fotoPerfil ? 'none' : 'flex'}}><PersonCircle size={24} /></div>
                                    </td>

                                    <td className="fw-bold">{u.nome}</td>
                                    <td style={{color: '#aaa'}}>{u.email}</td>

                                    {/* Badge Colorida: Vermelho p/ ADMIN, Cinza p/ USER */}
                                    <td className="text-center">
                                        {u.role === 'ADMIN'
                                            ? <Badge bg="danger" className="p-2"><ShieldLockFill className="me-1"/> ADMIN</Badge>
                                            : <Badge bg="secondary" className="p-2"><PersonFill className="me-1"/> USER</Badge>
                                        }
                                    </td>

                                    {/* Botão de Ação (Promover/Rebaixar) */}
                                    <td className="text-end">
                                        <Button
                                            variant="link"
                                            className={u.role === 'ADMIN' ? "text-danger" : "text-warning"}
                                            style={{textDecoration: 'none', fontWeight: 'bold'}}
                                            onClick={() => handleOpenModal(u)}
                                        >
                                            <PencilSquare className="me-1"/> {u.role === 'ADMIN' ? 'Rebaixar' : 'Promover'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal de Confirmação */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-dark">
                <Modal.Header closeButton><Modal.Title className="text-white">Alterar Permissão</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div className="text-center">
                            {/* Mostra foto ou ícone de alerta */}
                            {selectedUser.fotoPerfil ? <img src={selectedUser.fotoPerfil} alt={selectedUser.nome} className="user-avatar-small mb-3" style={{width: '80px', height:'80px'}} /> : <ExclamationTriangleFill size={50} className="text-warning mb-3" />}

                            <p>Você está prestes a alterar o cargo de:</p>
                            <h4 className="text-white">{selectedUser.nome}</h4>

                            {/* Resumo da mudança */}
                            <div className="mt-3 p-3 border border-secondary rounded bg-black">
                                Mudar de <strong>{selectedUser.role}</strong> para <strong className="text-danger">{selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN'}</strong>?
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={updating}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmChange} disabled={updating}>{updating ? <Spinner size="sm"/> : 'Confirmar Alteração'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminUsuariosPage;