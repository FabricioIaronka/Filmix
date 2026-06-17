import React, { useState, useEffect } from 'react';
// Bootstrap
import { Table, Button, Modal, Form, Spinner, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
// Serviços
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../../../services/generoService';
// Importa TUDO de ícones para renderizar dinamicamente
import * as Icons from 'react-bootstrap-icons';
import {
    PencilSquare,
    Trash,
    CheckCircleFill,
    XCircleFill,
    ExclamationTriangleFill
} from 'react-bootstrap-icons';
import '../../../styles/AdminTheme.css';

// Lista fixa de nomes de ícones permitidos (segurança e consistência)
const AVAILABLE_ICONS = [
    "Film", "LightningChargeFill", "Globe", "EmojiSmileFill", "Mask",
    "QuestionCircleFill", "TvFill", "DiamondFill", "HeartFill",
    "PersonBadgeFill", "BookFill", "Controller", "MegaphoneFill", "StarFill"
];

function AdminGenerosPage() {
    const [generos, setGeneros] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DO MODAL CRIAÇÃO/EDIÇÃO ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // Se null = Criando
    const [formData, setFormData] = useState({ nome: '', cor: '#dc3545', icone: 'Film' });
    const [saving, setSaving] = useState(false);

    // --- ESTADOS DO MODAL EXCLUSÃO ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [genreToDelete, setGenreToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Feedback
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Carrega dados iniciais
    const loadGeneros = async () => {
        setLoading(true);
        try {
            const data = await getGeneros();
            setGeneros(data);
        } catch (e) {
            showFeedback("Erro ao carregar gêneros.", "danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadGeneros(); }, []);

    const showFeedback = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- LÓGICA DE CRIAÇÃO/EDIÇÃO ---
    // Abre o modal. Se passar 'g', é edição. Se não, limpa o form para criação.
    const handleShowModal = (g) => {
        if(g) {
            setEditingId(g.id);
            setFormData({nome: g.nome, cor: g.cor, icone: g.icone});
        } else {
            setEditingId(null);
            setFormData({nome: '', cor: '#dc3545', icone: 'Film'});
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if(editingId) {
                // PUT
                await updateGenero(editingId, formData);
                showFeedback("Gênero atualizado com sucesso!");
            } else {
                // POST
                await createGenero(formData);
                showFeedback("Gênero criado com sucesso!");
            }
            setShowModal(false);
            loadGeneros();
        } catch(e) {
            showFeedback("Erro ao salvar gênero.", "danger");
        } finally {
            setSaving(false);
        }
    };

    // --- LÓGICA DE EXCLUSÃO ---
    const openDeleteModal = (g) => {
        setGenreToDelete(g);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if(!genreToDelete) return;
        setDeleting(true);
        try {
            await deleteGenero(genreToDelete.id);
            showFeedback("Gênero excluído com sucesso.");
            setShowDeleteModal(false);
            loadGeneros();
        } catch (e) {
            // Se o backend tiver integridade referencial (FK), vai dar erro se tiver filme usando
            showFeedback("Erro ao excluir. Verifique se há filmes usando este gênero.", "danger");
        } finally {
            setDeleting(false);
        }
    };

    // --- RENDERIZAÇÃO DINÂMICA DE ÍCONES ---
    // Pega o nome string (ex: "StarFill") e transforma no Componente React correspondente
    const renderIcon = (name) => {
        const I = Icons[name] || Icons.Film; // Se o ícone não existir, usa "Film" como fallback
        return <I size={20}/>
    };

    return (
        <div className="admin-container">

            {/* Componente Toast (Notificações) */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast
                    onClose={() => setToast({ ...toast, show: false })}
                    show={toast.show}
                    delay={4000}
                    autohide
                    className={`cinema-toast border-${toast.variant === 'success' ? 'success' : 'danger'}`}
                >
                    <Toast.Header closeButton={true} className="bg-dark text-white border-bottom-0">
                        {toast.variant === 'success' ? <CheckCircleFill className="text-success me-2"/> : <XCircleFill className="text-danger me-2"/>}
                        <strong className="me-auto">{toast.variant === 'success' ? 'Sucesso' : 'Erro'}</strong>
                    </Toast.Header>
                    <Toast.Body className="bg-dark text-white">
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-title">Gerenciar Gêneros</h2>
                    <p className="page-subtitle">Edite cores e ícones dos cartões.</p>
                </div>
                <Button variant="danger" onClick={() => handleShowModal()}>+ Novo Gênero</Button>
            </div>

            {/* Tabela de Gêneros */}
            {loading ? <Spinner animation="border" variant="danger" /> : (
                <div className="table-responsive">
                    <Table className="table-cinema" hover>
                        <thead>
                            <tr>
                                <th className="text-center">Ícone</th>
                                <th>Nome</th>
                                <th>Cor</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generos.map(g => (
                                <tr key={g.id}>
                                    {/* Exibe o ícone colorido */}
                                    <td className="text-center" style={{color: g.cor}}>{renderIcon(g.icone)}</td>

                                    <td className="fw-bold">{g.nome}</td>

                                    {/* Mostra a bolinha da cor e o código Hex */}
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div style={{width: 20, height: 20, backgroundColor: g.cor, borderRadius: '50%', marginRight: 10, border: '1px solid #555'}}></div>
                                            <span style={{color: '#aaa'}}>{g.cor}</span>
                                        </div>
                                    </td>

                                    <td className="text-end">
                                        <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleShowModal(g)}>
                                            <PencilSquare />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(g)}>
                                            <Trash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* --- MODAL DE EDIÇÃO/CRIAÇÃO --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-dark">
                <Modal.Header closeButton>
                    <Modal.Title className="text-white">{editingId ? 'Editar Gênero' : 'Novo Gênero'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSave}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-light">Nome</Form.Label>
                            <Form.Control type="text" className="form-control-dark" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Cor</Form.Label>
                                    {/* Input type="color" nativo do HTML5 */}
                                    <Form.Control type="color" className="form-control form-control-color w-100 bg-dark border-secondary" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Ícone</Form.Label>
                                    {/* Select com a lista de ícones permitidos */}
                                    <Form.Select className="form-control-dark" value={formData.icone} onChange={e => setFormData({...formData, icone: e.target.value})}>
                                        {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* PREVIEW EM TEMPO REAL: Mostra como o gênero vai ficar */}
                        <div className="p-3 rounded text-center mt-2" style={{border: `2px solid ${formData.cor}`, background: '#111'}}>
                             <div style={{color: formData.cor, fontSize: '2rem', marginBottom:'5px'}}>{renderIcon(formData.icone)}</div>
                             <h4 className="m-0" style={{color: '#fff'}}>{formData.nome || 'Preview'}</h4>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
                        <Button variant="danger" type="submit" disabled={saving}>
                            {saving ? <Spinner size="sm"/> : "Salvar"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* --- MODAL DE EXCLUSÃO --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-dark">
                {/* ... (Conteúdo padrão de confirmação) ... */}
                <Modal.Header closeButton>
                    <Modal.Title className="text-white">Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <ExclamationTriangleFill size={40} className="text-danger mb-3" />
                    <p className="text-white mb-1">Tem certeza que deseja excluir o gênero:</p>
                    <h4 className="text-white fw-bold">"{genreToDelete?.nome}"</h4>
                    <p className="text-muted small mt-2">
                        Isso pode afetar os filmes associados a este gênero.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
                        {deleting ? <Spinner size="sm"/> : "Sim, Excluir"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminGenerosPage;