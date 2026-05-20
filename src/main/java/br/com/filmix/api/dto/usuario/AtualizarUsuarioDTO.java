package br.com.filmix.api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record AtualizarUsuarioDTO(
        @NotBlank
        String nome,

        @NotBlank
        @Email
        String email,

        String fotoPerfil
) {
}
