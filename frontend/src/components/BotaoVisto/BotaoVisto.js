import React from 'react';
import { Button } from 'react-bootstrap';
import { CheckCircleFill, EyeFill } from 'react-bootstrap-icons';

function BotaoVisto({ visto, onClick, disabled = false }) {

    const variant = visto ? 'success' : 'outline-secondary';

    // Muda o ícone e o texto
    const icon = visto ? <CheckCircleFill /> : <EyeFill />;
    const text = visto ? 'Visto' : 'Marcar como Visto';

    return (
        <Button
            variant={variant}
            onClick={onClick}
            disabled={disabled}
            className="btn-toggle-visto"
        >
            {icon}
            <span className="ms-2">{text}</span>
        </Button>
    );
}

export default BotaoVisto;