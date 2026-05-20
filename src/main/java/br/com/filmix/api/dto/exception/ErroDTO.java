package br.com.filmix.api.dto.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public record ErroDTO(
        LocalDateTime timestamp,
        Integer status,
        String erro,
        String mensagem,
        String caminho
) {
    public ErroDTO(HttpStatus status, String mensagem, String caminho) {
        this(LocalDateTime.now(), status.value(), status.getReasonPhrase(), mensagem, caminho);

    }
}