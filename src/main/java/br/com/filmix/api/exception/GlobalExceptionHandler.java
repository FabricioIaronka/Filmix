package br.com.filmix.api.exception;

import br.com.filmix.api.dto.exception.ErroDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroDTO> tratarRecursoNaoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest request) {
        ErroDTO erro = new ErroDTO(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroDTO> tratarRegraDeNegocio(RegraDeNegocioException ex, HttpServletRequest request) {
        ErroDTO erro = new ErroDTO(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroDTO> tratarValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String mensagem = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        ErroDTO erro = new ErroDTO(HttpStatus.BAD_REQUEST, mensagem, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErroDTO> tratarErro404(EntityNotFoundException ex, HttpServletRequest request) {
        ErroDTO erro = new ErroDTO(HttpStatus.NOT_FOUND, "Recurso não encontrado", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }



}
