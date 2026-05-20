package br.com.filmix.api.dto.usuario;

import br.com.filmix.api.model.Role;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        String fotoPerfil,
        Role role
) {
}
