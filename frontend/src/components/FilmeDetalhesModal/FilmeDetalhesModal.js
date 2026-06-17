import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Tabs, Tab, Form, FormControl } from 'react-bootstrap';
import { getAvaliacoesPorFilme, criarAvaliacao, deleteAvaliacao } from '../../services/avaliacaoService';
import { getMe } from '../../services/usuarioService';
import { TrashFill } from 'react-bootstrap-icons';
import './FilmeDetalhesModal.css';

function FilmeDetalhesModal({ show, onHide, filme, footerBotoes, statusVisto }) {

    const [activeTab, setActiveTab] = useState('detalhes'); // controla qual aba está aberta
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
    const [error, setError] = useState('');

    //média das notas e total de avaliações
    const [stats, setStats] = useState({ media: 0, total: 0 });

    const [showForm, setShowForm] = useState(false); // abre/fecha o form de avaliar
    const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: '', comentario: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [currentUser, setCurrentUser] = useState(null); // quem está logado
    const [minhaAvaliacao, setMinhaAvaliacao] = useState(null); // se eu já avaliei, guarda aqui
    const [outrasAvaliacoes, setOutrasAvaliacoes] = useState([]); // avaliações dos outros usuários

    // modal de confirmação de exclusão (modal dentro de modal)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [avaliacaoParaRemover, setAvaliacaoParaRemover] = useState(null);

    // descobre quem é o usuário logado (para saber se a avaliação é dele)
    const fetchCurrentUser = async () => {
        try {
            const userData = await getMe();
            setCurrentUser(userData);
            return userData;
        } catch (err) { return null; }
    };

    // busca as avaliações do backend e organiza os dados
    const fetchAvaliacoes = async (filmeId, user) => {
        try {
            setLoadingAvaliacoes(true);
            setError('');
            const dados = (await getAvaliacoesPorFilme(filmeId)) || [];

            // lógica de Média (cálculo no front)
            if (dados.length > 0) {
                // soma todas as notas e divide pelo total
                const totalNotas = dados.reduce((acc, ava) => acc + ava.nota, 0);
                const media = totalNotas / dados.length;
                setStats({ media: media, total: dados.length });
            } else {
                setStats({ media: 0, total: 0 });
            }

            // separação: Minha Avaliação vs Outras
            if (user) {
                // procura se existe alguma avaliação onde o ID do usuário é igual ao meu
                const avaliacaoPropria = dados.find(a => a.nomeUsuario?.id === user.id);
                // filtra todas as outras
                const avaliacoesDeOutros = dados.filter(a => a.nomeUsuario?.id !== user.id);

                setOutrasAvaliacoes(avaliacoesDeOutros);

                // se eu já avaliei, preenche o formulário com meus dados p edição
                if (avaliacaoPropria) {
                    setMinhaAvaliacao(avaliacaoPropria);
                    setNovaAvaliacao({ nota: avaliacaoPropria.nota, comentario: avaliacaoPropria.comentario || '' });
                } else {
                    setMinhaAvaliacao(null);
                    setNovaAvaliacao({ nota: '', comentario: '' });
                }
            } else {
                setOutrasAvaliacoes(dados);
                setMinhaAvaliacao(null);
            }
        } catch (err) {
            setError('Não foi possível carregar as avaliações.');
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    // --- EFEITO ---
    useEffect(() => {
        const loadData = async () => {
            // só carrega se o modal estiver aberto E tiver um filme selecionado
            if (show && filme) {
                const user = await fetchCurrentUser();
                // Otimização: Só busca avaliações se o usuário clicar na aba "Avaliações"
                if (activeTab === 'avaliacoes') {
                    await fetchAvaliacoes(filme.id, user);
                }
            } else {
                // limpa os estados quando o modal fecha (Reseta tudo)
                setActiveTab('detalhes');
                setError('');
                setNovaAvaliacao({ nota: '', comentario: '' });
                setCurrentUser(null);
                setMinhaAvaliacao(null);
                setOutrasAvaliacoes([]);
                setShowForm(false);
            }
        };
        loadData();
    }, [activeTab, show, filme]); // Roda sempre que mudar a aba, abrir o modal ou trocar o filme

    // atualiza o estado enquanto o usuário digita
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNovaAvaliacao(prev => ({ ...prev, [name]: value }));
    };

    // envia a nova avaliação ou edição para o backend
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const payload = { nota: parseFloat(novaAvaliacao.nota), comentario: novaAvaliacao.comentario };
            await criarAvaliacao(filme.id, payload);
            setShowForm(false); // fecha o formulário
            await fetchAvaliacoes(filme.id, currentUser); // recarrega a lista para mostrar a nova nota
        } catch (err) {
            setError("Erro ao salvar avaliação.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- LÓGICA DE REMOÇÃO ---
    const handleAbrirModalRemocao = (av) => { setAvaliacaoParaRemover(av); setShowDeleteModal(true); };
    const handleFecharModalRemocao = () => { setAvaliacaoParaRemover(null); setShowDeleteModal(false); };

    const handleConfirmarRemocao = async () => {
        if (!avaliacaoParaRemover) return;
        try {
            await deleteAvaliacao(filme.id, avaliacaoParaRemover.id);
            await fetchAvaliacoes(filme.id, currentUser); // atualiza a lista após remover
            handleFecharModalRemocao();
        } catch (err) {
            setError("Erro ao remover avaliação.");
            handleFecharModalRemocao();
        }
    };

    if (!filme) return null;

    // função auxiliar para renderizar cada item da lista
    const renderAvaliacaoItem = (ava, isPropria) => (
        <li key={ava.id} className={`avaliacao-item ${isPropria ? 'avaliacao-propria' : ''}`}>
            <div className="avaliacao-header">
                <div className="avaliacao-header-info">
                    <span className="nome-usuario">{ava.nomeUsuario?.nome || "Anônimo"} {isPropria && "(Sua Avaliação)"}</span>
                    <span className="nota-badge">{ava.nota.toFixed(1)}</span>
                </div>
                {/* Só mostra o lixo se for a MINHA avaliação */}
                {isPropria && (
                    <Button variant="link" className="btn-remover-icon" onClick={() => handleAbrirModalRemocao(ava)}>
                        <TrashFill size={18} />
                    </Button>
                )}
            </div>
            <p className="avaliacao-comentario">{ava.comentario}</p>
        </li>
    );

    // --- RENDERIZAÇÃO (JSX) ---
    return (
        <>
            {/* Modal Principal */}
            <Modal show={show} onHide={onHide} centered size="lg" className="modal-dark">
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="detail-modal-body-top">
                        <img src={filme.fotoFilme || 'https://via.placeholder.com/400x600'} alt={filme.titulo} className="detail-modal-img"/>
                        <div className="detail-modal-info">
                            <h3>{filme.titulo}</h3>

                            {/* Sistema de Abas */}
                            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3 modal-tabs">

                                {/* ABA 1: DETALHES */}
                                <Tab eventKey="detalhes" title="Detalhes">
                                    <div className="tab-content">
                                        <p><strong>Lançamento:</strong> {filme.anoLancamento ? new Date(filme.anoLancamento).toLocaleDateString('pt-BR',{timeZone:'UTC'}) : 'N/A'}</p>
                                        <p><strong>Diretor:</strong> {filme.diretor || 'N/A'}</p>
                                        <p><strong>Gêneros:</strong> {filme.generos?.map(g => g.nome || g).join(', ') || 'N/A'}</p>
                                        {statusVisto !== undefined && <p><strong>Status:</strong> {statusVisto ? "Visto" : "Não visto"}</p>}
                                        <hr />
                                        <p className="sinopse">{filme.sinopse || "Sem sinopse."}</p>
                                    </div>
                                </Tab>

                                {/* ABA 2: AVALIAÇÕES */}
                                <Tab eventKey="avaliacoes" title="Avaliações">
                                    <div className="tab-content">
                                        {error && <Alert variant="danger">{error}</Alert>}

                                        {/* Cabeçalho da Aba: Média, Total e Botão Avaliar */}
                                        <div className="stats-container">
                                            <div className="stats-group">
                                                <div className="stat-item"><span className="stat-label">Média</span><span className="stat-value">{stats.media.toFixed(1)}</span></div>
                                                <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{stats.total}</span></div>
                                            </div>
                                            <Button variant="primary" className="btn-toggle-form" onClick={() => setShowForm(!showForm)}>{minhaAvaliacao ? "Editar" : "Avaliar"}</Button>
                                        </div>

                                        {/* Formulário */}
                                        <Form onSubmit={handleFormSubmit} className={`avaliacao-form ${showForm ? 'show' : ''}`}>
                                            <h5 className="mb-3">{minhaAvaliacao ? "Editar sua Avaliação" : "Nova Avaliação"}</h5>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nota (0-10)</Form.Label>
                                                <FormControl type="number" name="nota" value={novaAvaliacao.nota} onChange={handleFormChange} min="0" max="10" step="0.1" required />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Comentário</Form.Label>
                                                <FormControl as="textarea" rows={3} name="comentario" value={novaAvaliacao.comentario} onChange={handleFormChange} />
                                            </Form.Group>
                                            <div className="d-flex justify-content-end gap-2 mt-2">
                                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                                                <Button variant="primary" type="submit" disabled={submitLoading}>{submitLoading ? <Spinner size="sm" /> : "Enviar"}</Button>
                                            </div>
                                        </Form>

                                        {/* exibe minha avaliação em destaque, se existir */}
                                        {minhaAvaliacao && (
                                            <>
                                                <h4 className="avaliacao-section-header">Sua Avaliação</h4>
                                                <ul className="avaliacao-list minha-avaliacao-list">{renderAvaliacaoItem(minhaAvaliacao, true)}</ul>
                                            </>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>

                    {/* lista das avaliações dos OUTROS */}
                    {activeTab === 'avaliacoes' && (
                        <div className="demais-avaliacoes-container">
                            {loadingAvaliacoes && <div className="text-center mt-3"><Spinner animation="border" variant="danger" /></div>}

                            {!loadingAvaliacoes && outrasAvaliacoes.length > 0 && (
                                <>
                                    <h4 className="avaliacao-section-header">Comentários da Comunidade</h4>
                                    <ul className="avaliacao-list demais-avaliacoes-list">{outrasAvaliacoes.map(ava => renderAvaliacaoItem(ava, false))}</ul>
                                </>
                            )}

                            {/* Empty State: Ninguém avaliou ainda */}
                            {!loadingAvaliacoes && !minhaAvaliacao && outrasAvaliacoes.length === 0 && (
                                <div className="sem-avaliacoes-mensagem">Seja o primeiro a avaliar este filme!</div>
                            )}
                        </div>
                    )}
                </Modal.Body>

                {/* Footer dinâmico (ex: botão de adicionar à lista) */}
                <Modal.Footer>{footerBotoes}</Modal.Footer>
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal show={showDeleteModal} onHide={handleFecharModalRemocao} centered className="modal-dark">
                <Modal.Header closeButton><Modal.Title>Remover Avaliação</Modal.Title></Modal.Header>
                <Modal.Body>Tem certeza que deseja excluir?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleFecharModalRemocao}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmarRemocao}>Remover</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default FilmeDetalhesModal;