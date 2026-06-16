import React from 'react';
import { Navbar, Container, Button, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

function AppNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/home">
                    <img
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        alt="Filmix Logo"
                        style={{ marginRight: '10px' }}
                    />
                    Filmix
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Sair
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AppNavbar;