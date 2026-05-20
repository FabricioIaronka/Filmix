package br.com.filmix.api.dto.avaliacao;

import br.com.filmix.api.dto.filme.FilmeSimplificadoDTO;
import br.com.filmix.api.dto.usuario.UsuarioSimplificadoDTO;

import java.time.LocalDateTime;

public record AvaliacaoResponseDTO(
        Long id,
        Float nota,
        String comentario,
        LocalDateTime dataAvaliacao,
        UsuarioSimplificadoDTO nomeUsuario,
        FilmeSimplificadoDTO filme
) {
}