package br.com.filmix.api.dto.usuario;

import br.com.filmix.api.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres") String senha,
        String fotoPerfil,
        Role role
) {
}
