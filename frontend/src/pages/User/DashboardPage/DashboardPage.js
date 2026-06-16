import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { getMinhasEstatisticas } from '../../../services/filmeService';
import './DashboardPage.css';
import welcomeBanner from '../../../assets/images/welcome-banner.png';

function DashboardPage() {

    // --- ESTADOS ---
    const [stats, setStats] = useState({
        filmesNaLista: 0,
        minhasAvaliacoes: 0,
        filmesVistos: 0
    });
    const [loading, setLoading] = useState(true);

    // --- BUSCA DE DADOS (Ao carregar) ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Chama a API: GET /api/filmes/estatisticas
                const dados = await getMinhasEstatisticas();
                setStats(dados);
            } catch (error) {
                console.error("Erro ao buscar estatísticas", error);
                // Fallback: Zera tudo se der erro
                setStats({ filmesNaLista: 0, minhasAvaliacoes: 0, filmesVistos: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Helper para renderizar o valor ou um Spinner se estiver carregando
    const renderStatValue = (value) => {
        if (loading) {
            return <Spinner animation="border" variant="danger" size="sm" />;
        }
        return <h2 className="dashboard-card-value">{value}</h2>;
    };

    return (
        <div>
            {/* Títulos e Boas-vindas */}
            <h1 className="page-title">Home</h1>
            <p className="page-subtitle">Bem-vindo ao seu painel Filmix.</p>

            {/* Banner visual */}
            <div className="mt-4">
                <img
                    src={welcomeBanner}
                    alt="Bem-vindo ao Filmix"
                    className="welcome-banner-img"
                />
            </div>

            {/* Grid de Cards (Estatísticas) */}
            {/* Row xs=1 (celular 1 coluna) md=2 (tablet 2 colunas) lg=3 (pc 3 colunas) */}
            <Row xs={1} md={2} lg={3} className="g-4 dashboard-stats-row">

                {/* Card 1: Quantos filmes eu adicionei na minha lista? */}
                <Col>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <Card.Title>Filmes na Lista</Card.Title>
                            {renderStatValue(stats.filmesNaLista)}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card 2: Quantos desses eu já marquei como Visto? */}
                <Col>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <Card.Title>Filmes Vistos</Card.Title>
                            {renderStatValue(stats.filmesVistos)}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card 3: Quantas avaliações eu escrevi? */}
                <Col>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <Card.Title>Minhas Avaliações</Card.Title>
                            {renderStatValue(stats.minhasAvaliacoes)}
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
        </div>
    );
}

export default DashboardPage;