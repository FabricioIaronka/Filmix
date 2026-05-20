package br.com.filmix.api.dto;

public record TokenResponseDTO(
        String token,
        String nome,
        String email,
        String role
) {
}
