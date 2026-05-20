package br.com.filmix.api.dto.usuario;

public record EstatisticasUsuarioDTO(
        long filmesNaLista,
        long minhasAvaliacoes,
        Long filmesVistos
) { }