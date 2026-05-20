package br.com.filmix.api.dto.genero;

public record GeneroResponseDTO (
        Long id,
        String nome,
        String cor,
        String icone
){
}