package br.com.filmix.api.dto.usuario;

import br.com.filmix.api.dto.filme.FilmeResponseDTO;

public record UsuarioFilmeResponseDTO(
        FilmeResponseDTO filme,
        boolean visto
) {
}