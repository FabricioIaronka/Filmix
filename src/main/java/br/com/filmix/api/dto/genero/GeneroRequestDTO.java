package br.com.filmix.api.dto.genero;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GeneroRequestDTO(
        @NotBlank(message = "O nome não pode ser vazio")
        @Size(min = 3, max = 50, message = "O nome deve ter entre 3 e 50 caracteres")
        String nome,

        String cor,
        String icone
) {
}