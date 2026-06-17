import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, InputGroup, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile, updatePassword, deleteMyAccount } from '../../../services/usuarioService';
import { logout } from '../../../services/authService';
import {
    PersonCircle,
    EyeFill,
    EyeSlashFill,
    SaveFill,
    ShieldLockFill,
    ExclamationTriangleFill,
    CheckCircleFill,
    XCircleFill
} from 'react-bootstrap-icons';
import './PerfilPage.css';

// URLs fixas para o usuário escolher se não tiver link próprio
const DEFAULT_AVATARS = [
    "https://recreio.com.br/wp-content/uploads/animacoes/scooby_doo_capa.jpg",
    "https://media.istockphoto.com/id/1503385646/pt/foto/portrait-funny-and-happy-shiba-inu-puppy-dog-peeking-out-from-behind-a-blue-banner-isolated-on.jpg?s=612x612&w=0&k=20&c=svp3fKo9okQL-AsBZbBXRx5TC5deE7jDbUKQAQl2hOc=",
    "https://sesameworkshop.org/wp-content/uploads/2023/02/presskit_ss_bio_oscar-376x282.png",
    "https://s3.amazonaws.com/blog.dentrodahistoria.com.br/wp-content/uploads/2023/02/14174717/jessie-toy-story.jpg",
    "https://i.pinimg.com/736x/70/61/3e/70613e4a9fac437865d35ee2a458c991.jpg",
    "https://m.media-amazon.com/images/S/pv-target-images/dbf6812f59e5080cf420f1056bfceb66f7d6a43a8df19ace503ea70596afc0ff._SX1080_FMjpg_.jpg"
];

function PerfilPage() {
  const navigate = useNavigate();

  // Estados de Dados
  const [user, setUser] = useState({ nome: '', email: '', fotoPerfil: '' });
  const [passwords, setPasswords] = useState({ senhaAntiga: '', senhaNova: '' });

  // UI States
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Carrega dados ao abrir
  useEffect(() => { loadData(); }, []);

  const showFeedback = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const loadData = async () => {
    try {
      const data = await getMe(); // GET /api/usuarios/me
      setUser(data);
    } catch (error) {
      showFeedback('Erro ao carregar perfil.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // --- ATUALIZAR PERFIL (Nome/Foto) ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user); // PUT /api/usuarios/me
      showFeedback('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      showFeedback('Erro ao atualizar perfil.', 'danger');
    }
  };

  // --- ALTERAR SENHA ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(passwords); // PATCH /api/usuarios/me/senha
      showFeedback('Senha alterada com sucesso!', 'success');
      setPasswords({ senhaAntiga: '', senhaNova: '' }); // Limpa campos
      setShowSenhaNova(false); // Esconde senha
    } catch (error) {
      showFeedback('Erro ao alterar senha. Verifique a senha atual.', 'danger');
    }
  };

  // --- EXCLUIR CONTA (Zona de Perigo) ---
  const confirmDeleteAccount = async () => {
    try {
      await deleteMyAccount(); // DELETE /api/usuarios/me
      logout(); // Limpa Token do LocalStorage
      navigate('/login'); // Manda para Login
    } catch (error) {
      showFeedback('Erro ao excluir conta.', 'danger');
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="cinema-loading-screen"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Container className="cinema-profile-container d-flex justify-content-center align-items-center py-5">

      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
        <Toast
            onClose={() => setToast({ ...toast, show: false })}
            show={toast.show}
            delay={4000}
            autohide
            className={`cinema-toast ${toast.variant === 'success' ? 'border-success' : 'border-danger'}`}
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

      {/* Card Principal */}
      <div className="cinema-profile-card animate-fade-in">

        {/* Header com Avatar Grande */}
        <div className="cinema-card-header text-center">
          <div className="cinema-avatar-container mb-3">
            {user.fotoPerfil ? (
              <img src={user.fotoPerfil} alt="Perfil" className="cinema-avatar-img" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
            ) : null}
             <div className="cinema-avatar-placeholder" style={{display: user.fotoPerfil ? 'none' : 'flex'}}>
                <PersonCircle />
             </div>
          </div>
          <h2 className="cinema-profile-name">{user.nome}</h2>
          <p className="cinema-profile-email">{user.email}</p>
        </div>

        <div className="cinema-card-body">

          {/* FORMULÁRIO DE DADOS */}
          <div className="cinema-section mb-5">
            <h5 className="cinema-section-title"><PersonCircle className="me-2"/>Informações Pessoais</h5>
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group className="mb-3">
                <Form.Label className="cinema-label">Nome de Exibição</Form.Label>
                <Form.Control className="cinema-input" value={user.nome} onChange={e => setUser({ ...user, nome: e.target.value })} />
              </Form.Group>

              {/* Email é Disabled (não editável) */}
              <Form.Group className="mb-3">
                <Form.Label className="cinema-label">Email (Login)</Form.Label>
                <Form.Control className="cinema-input" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
              </Form.Group>

              {/* Seletor de Avatar */}
              <Form.Group className="mb-4">
                <Form.Label className="cinema-label">Foto de Perfil</Form.Label>

                {/* Input Manual */}
                <Form.Control
                    className="cinema-input mb-3"
                    placeholder="Cole um link ou escolha abaixo..."
                    value={user.fotoPerfil || ''}
                    onChange={e => setUser({ ...user, fotoPerfil: e.target.value })}
                />

                {/* Grid de Imagens Clicáveis */}
                <p className="text-muted small mb-2">Ou escolha um dos nossos:</p>
                <div className="avatar-selection-grid">
                    {DEFAULT_AVATARS.map((avatarUrl, index) => (
                        <img
                            key={index}
                            src={avatarUrl}
                            alt={`Avatar ${index}`}
                            // Adiciona classe 'selected' se for o atual
                            className={`avatar-option ${user.fotoPerfil === avatarUrl ? 'selected' : ''}`}
                            onClick={() => setUser({ ...user, fotoPerfil: avatarUrl })}
                        />
                    ))}
                </div>
              </Form.Group>

              <Button variant="danger" type="submit" className="cinema-btn-primary w-100"><SaveFill className="me-2"/>Salvar Alterações</Button>
            </Form>
          </div>

          <div className="cinema-divider"></div>

          {/* FORMULÁRIO DE SENHA */}
          <div className="cinema-section mt-5">
            <h5 className="cinema-section-title text-danger"><ShieldLockFill className="me-2"/>Segurança</h5>
            <Form onSubmit={handleUpdatePassword}>
              <Form.Group className="mb-3">
                <Form.Label className="cinema-label">Senha Atual</Form.Label>
                <Form.Control type="password" className="cinema-input" value={passwords.senhaAntiga} onChange={e => setPasswords({ ...passwords, senhaAntiga: e.target.value })} placeholder="••••••"/>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="cinema-label">Nova Senha</Form.Label>
                <InputGroup className="cinema-input-group">
                  <Form.Control
                    type={showSenhaNova ? 'text' : 'password'}
                    className="cinema-input border-end-0"
                    value={passwords.senhaNova}
                    onChange={e => setPasswords({ ...passwords, senhaNova: e.target.value })}
                    placeholder="••••••"
                  />
                  <Button variant="outline-secondary" className="cinema-input-addon" onClick={() => setShowSenhaNova(s => !s)} title={showSenhaNova ? 'Ocultar' : 'Mostrar'}>
                    {showSenhaNova ? <EyeSlashFill /> : <EyeFill />}
                  </Button>
                </InputGroup>
              </Form.Group>
              <Button variant="outline-light" type="submit" className="cinema-btn-secondary w-100 mb-4">Atualizar Senha</Button>
            </Form>

            {/* BOTÃO DE EXCLUIR CONTA */}
            <div className="cinema-danger-zone text-center">
               <p className="small text-muted mb-2"><ExclamationTriangleFill className="text-danger me-1"/> Zona de Perigo</p>
               <button className="btn-delete-account" onClick={() => setShowDeleteModal(true)}>Excluir Conta Permanentemente</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="cinema-modal"
        backdrop="static" // Obriga a clicar nos botões, não fecha clicando fora
      >
        <Modal.Header className="border-0 pb-0">
            <Modal.Title className="text-danger fw-bold">
                <ExclamationTriangleFill className="me-2 mb-1"/>
                Excluir Conta?
            </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
            <p className="text-white">
                Tem certeza absoluta? Esta ação apagará <strong>todos os seus dados</strong>, favoritos e avaliações.
            </p>
            <p className="text-muted small">Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteAccount}>
                Sim, excluir minha conta
            </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default PerfilPage;