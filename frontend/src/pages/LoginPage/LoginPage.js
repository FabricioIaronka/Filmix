import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { EyeFill, EyeSlashFill, ProjectorFill } from 'react-bootstrap-icons';
import logoBranca from '../../assets/images/logo-white.png';
import { login } from '../../services/authService';
import '../../styles/AuthStyles.css';

function LoginPage() {
    // Guardam o que o usuário digita
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estado para mostrar/ocultar senha
    const [showPassword, setShowPassword] = useState(false);

    // Feedback visual (carregando, erro, sucesso)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registroSucesso, setRegistroSucesso] = useState(false);

    // Hooks de navegação
    const navigate = useNavigate(); // Para trocar de página via código
    const [searchParams] = useSearchParams(); // Para ler parâmetros da URL (ex: ?registro=sucesso)

    // --- EFEITO: MENSAGEM DE SUCESSO ---
    // Roda ao carregar a página. Verifica se veio do cadastro com sucesso.
    useEffect(() => {
        if (searchParams.get('registro') === 'sucesso') {
            setRegistroSucesso(true);
            setError('');
        }
    }, [searchParams]);

    // --- LÓGICA DE LOGIN ---
    const handleSubmit = async (event) => {
        event.preventDefault(); // Evita recarregar a página
        setError('');
        setRegistroSucesso(false); // Evita recarregar a página
        setLoading(true); // Ativa o spinner

        try {
            const data = await login(email, password);
            localStorage.setItem('authToken', data.token); // Se der certo, salva o Token JWT no navegador
            if(data.nome) localStorage.setItem('user', JSON.stringify(data)); // Salva dados do usuário (opcional, útil para mostrar nome no header)
            navigate('/home');
        } catch (err) {
            setError('Credenciais inválidas. Verifique email e senha.');
        } finally {
            setLoading(false); // Desativa o spinner
        }
    };

    // --- RENDERIZAÇÃO (JSX) ---
    return (
        <div className="auth-cinema-container">

            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="auth-form-section">
                <div className="auth-content-box">

                    {/* Ícone Decorativo (Projetor) */}
                    <div className="auth-icon-header">
                        <ProjectorFill />
                    </div>

                    <h1 className="auth-title-decor">Bem-vindo <br/>de volta</h1>
                    <p className="auth-subtitle-decor">Prepare a pipoca. Sua sessão vai começar.</p>

                    <Form onSubmit={handleSubmit}>
                        {/* Alertas Condicionais (Erro ou Sucesso) */}
                        {error && <Alert variant="danger" className="py-2 small bg-danger text-white border-0">{error}</Alert>}
                        {registroSucesso && <Alert variant="success" className="py-2 small bg-success text-white border-0">Conta criada! Pode entrar.</Alert>}

                        {/* Campo de Email */}
                        <Form.Group className="cinema-input-group">
                            <Form.Label className="cinema-input-label">Email de Acesso</Form.Label>
                            <Form.Control
                                className="cinema-modern-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Campo de Senha */}
                        <Form.Group className="cinema-input-group">
                            <Form.Label className="cinema-input-label">Sua Senha</Form.Label>

                            {/* Input com tipo dinâmico (text/password) */}
                            <Form.Control
                                className="cinema-modern-input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {/* Botão do Olho */}
                            <button
                                type="button"
                                className="cinema-eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1" // p não focar ao dar Tab
                            >
                                {showPassword ? <EyeSlashFill size={20}/> : <EyeFill size={20}/>}
                            </button>
                        </Form.Group>

                        {/* Botão de Entrar */}
                        <Button className="btn-cinema-decor" type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border"/> : "ENTRAR AGORA"}
                        </Button>

                        {/* Link para Cadastro */}
                        <div className="auth-footer-decor">
                            Ainda não tem ingresso?
                            <Link to="/register" className="auth-link-decor">
                                Criar Conta
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>

            {/* LADO DIREITO: IMAGEM + LOGO GIGANTE */}
            <div className="auth-image-section">
                <img src={logoBranca} alt="Filmix" className="auth-overlay-logo" />
            </div>

        </div>
    );
}

export default LoginPage;