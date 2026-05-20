package br.com.filmix.api.controller;

import br.com.filmix.api.dto.genero.GeneroRequestDTO;
import br.com.filmix.api.dto.genero.GeneroResponseDTO;
import br.com.filmix.api.service.GeneroService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/generos")
@AllArgsConstructor
public class GeneroController {

    private final GeneroService generoService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<GeneroResponseDTO> criar(@RequestBody @Valid GeneroRequestDTO dto) {
        GeneroResponseDTO response = generoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<GeneroResponseDTO>> listarTodos() {
        List<GeneroResponseDTO> response = generoService.listarTodos();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<GeneroResponseDTO> buscarPorId(@PathVariable Long id) {
        GeneroResponseDTO response = generoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<GeneroResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid GeneroRequestDTO dto) {
        GeneroResponseDTO response = generoService.atualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        generoService.deletar(id);
    }

}