package br.com.filmix.api.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(
        @NotBlank
        String senhaAntiga,

        @NotBlank
        @Size(min = 6, message = "Nova senha deve ter no mínimo 6 caracteres")
        String senhaNova
) {
}
