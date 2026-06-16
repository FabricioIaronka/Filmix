import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { PersonPlusFill, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { registrar } from '../../services/authService';
import logoBranca from '../../assets/images/logo-white.png';
import '../../styles/AuthStyles.css';

function RegistroPage() {
    // Armazenam o que o usuário digita nos campos em tempo real
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // Estado booleano (true/false) para controlar a visibilidade da senha (olhinho)
    const [showPassword, setShowPassword] = useState(false);

    // Estados para feedback visual ao usuário
    const [error, setError] = useState(''); // Guarda mensagem de erro se falhar
    const [loading, setLoading] = useState(false); // Controla o spinner de carregamento

    // Hook para redirecionar o usuário após o cadastro (ex: ir para o login)
    const navigate = useNavigate();

    // --- LÓGICA DE ENVIO ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previne que a página recarregue (comportamento padrão de formulários HTML)
        setLoading(true);   // Ativa o spinner no botão
        setError('');       // Limpa erros anteriores

        try {
            await registrar(nome, email, senha);

            // Se der certo (200 OK), redireciona para o login com um parâmetro de sucesso na URL
            navigate('/login?registro=sucesso');
        } catch (err) {
            setError('Erro ao criar conta. Tente novamente.');
        } finally {
            // Roda sempre (dando certo ou errado) para parar o spinner
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO (JSX) ---
    return (
        <div className="auth-cinema-container">

            {/* Metade Esquerda: Formulário */}
            <div className="auth-form-section">
                <div className="auth-content-box">

                    {/* Ícone de Usuário no topo */}
                    <div className="auth-icon-header">
                        <PersonPlusFill />
                    </div>

                    <h1 className="auth-title-decor">Criar Conta</h1>
                    <p className="auth-subtitle-decor">Junte-se ao maior clube de cinema.</p>

                    {/* Formulário dispara handleSubmit ao clicar em "Criar Minha Conta" ou dar Enter */}
                    <Form onSubmit={handleSubmit}>

                        {/* Renderização Condicional: Só mostra o Alerta se houver erro */}
                        {error && <Alert variant="danger" className="py-2 small bg-danger text-white border-0">{error}</Alert>}

                        {/* Campo: Nome Completo */}
                        <Form.Group className="cinema-input-group">
                            <Form.Label className="cinema-input-label">Nome Completo</Form.Label>
                            <Form.Control
                                className="cinema-modern-input"
                                type="text"
                                value={nome}
                                // Atualiza o estado 'nome' a cada letra digitada
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Campo: Email */}
                        <Form.Group className="cinema-input-group">
                            <Form.Label className="cinema-input-label">Email</Form.Label>
                            <Form.Control
                                className="cinema-modern-input"
                                type="email" // Validação nativa de email do navegador
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Campo: Senha com Toggle de Visibilidade */}
                        <Form.Group className="cinema-input-group">
                            <Form.Label className="cinema-input-label">Senha</Form.Label>
                            <Form.Control
                                className="cinema-modern-input"
                                // Aqui está a mágica: Se showPassword for true, vira 'text', senão 'password'
                                type={showPassword ? 'text' : 'password'}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                            {/* Botão do Olho (fica posicionado via CSS absolute dentro do input-group) */}
                            <button
                                type="button"
                                className="cinema-eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeSlashFill size={20}/> : <EyeFill size={20}/>}
                            </button>
                        </Form.Group>

                        {/* Botão de Enviar */}
                        <Button className="btn-cinema-decor" type="submit" disabled={loading}>
                            {/* Se estiver carregando, mostra Spinner, senão mostra o Texto */}
                            {loading ? <Spinner size="sm" animation="border"/> : "CRIAR MINHA CONTA"}
                        </Button>

                        {/* Link para voltar ao Login */}
                        <div className="auth-footer-decor">
                            Já possui conta?
                            <Link to="/login" className="auth-link-decor">
                                Fazer Login
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Metade Direita: Imagem de Fundo e Logo */}
            <div className="auth-image-section">
                <img src={logoBranca} alt="Filmix" className="auth-overlay-logo" />
            </div>

        </div>
    );
}

export default RegistroPage;