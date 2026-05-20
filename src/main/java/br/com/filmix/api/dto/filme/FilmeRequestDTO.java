package br.com.filmix.api.dto.filme;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;
import java.util.Set;

public record FilmeRequestDTO(
        @NotBlank
        String titulo,

        String sinopse,
        String diretor,
        LocalDate anoLancamento,
        String fotoFilme,

        @NotEmpty(message = "O filme deve ter pelo menos um gênero")
        Set<Long> generoIds
) {
}