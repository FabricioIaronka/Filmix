package br.com.filmix.api.dto.filme;

import br.com.filmix.api.dto.genero.GeneroResponseDTO;

import java.time.LocalDate;
import java.util.Set;

public record FilmeResponseDTO(
        Long id,
        String titulo,
        String sinopse,
        String diretor,
        LocalDate anoLancamento,
        String fotoFilme,
        Set<GeneroResponseDTO> generos
) {
}