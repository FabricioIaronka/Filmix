import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getGeneros } from '../../../services/generoService';
import './GenerosPage.css';
import * as Icons from 'react-bootstrap-icons';

function GenerosPage() {
    // --- ESTADOS ---
    const [generos, setGeneros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // --- CARREGAMENTO ---
    useEffect(() => {
        const fetchGeneros = async () => {
            try {
                setLoading(true);
                const data = await getGeneros();
                setGeneros(data);
            } catch (err) {
                setError('Não foi possível carregar os gêneros.');
            } finally {
                setLoading(false);
            }
        };
        fetchGeneros();
    }, []);

    // --- AÇÃO DE CLIQUE ---
    // Quando clica no card, envia o usuário para a página de Explorar
    // mas passando o ID do gênero na URL (?genero=1)
    const handleGenreClick = (genreId) => {
        navigate(`/explorar?genero=${genreId}`);
    };

    // --- RENDERIZAÇÃO DINÂMICA DE ÍCONES ---
    // Mesmo truque da página de Admin: Converte string em componente
    const renderIcon = (iconName) => {
        const IconComponent = Icons[iconName];
        return IconComponent ? <IconComponent /> : <Icons.Film />;
    };

    if (loading) return <Spinner animation="border" variant="danger" className="d-block mx-auto mt-5" />;

    return (
        <div>
            {/* Header */}
            <div className="page-header-container">
                <div>
                    <h1 className="page-title">Explorar por Gênero</h1>
                    <p className="page-subtitle">Navegue pelas categorias.</p>
                </div>
            </div>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            {/* Grid de Cards */}
            <Row xs={1} md={2} lg={4} className="g-4 mt-5">
                {generos.map(genero => (
                    <Col key={genero.id}>
                        <div
                            className="genre-card"
                            onClick={() => handleGenreClick(genero.id)}
                            title={`Ver filmes de ${genero.nome}`}

                            // --- TRUQUE DE CSS AVANÇADO ---
                            // Injetamos a cor vinda do banco direto numa Variável CSS.
                            // No arquivo .css, usamos var(--genre-color) para pintar o hover/borda.
                            style={{ '--genre-color': genero.cor || '#dc3545' }}
                        >
                            {/* O ícone herda a cor da variável definida acima */}
                            <div className="genre-card-icon-container" style={{ color: 'var(--genre-color)' }}>
                                {renderIcon(genero.icone)}
                            </div>
                            <h3 className="genre-card-title">{genero.nome}</h3>
                            <p className="genre-card-subtitle">Ver Filmes</p>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default GenerosPage;