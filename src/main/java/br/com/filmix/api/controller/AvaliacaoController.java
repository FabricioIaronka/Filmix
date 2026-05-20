package br.com.filmix.api.controller;

import br.com.filmix.api.dto.avaliacao.AvaliacaoRequestDTO;
import br.com.filmix.api.dto.avaliacao.AvaliacaoResponseDTO;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/filmes/{filmeId}/avaliacoes")
@AllArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criar(@PathVariable Long filmeId, @RequestBody @Valid AvaliacaoRequestDTO dto, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        AvaliacaoResponseDTO response = avaliacaoService.criar(filmeId, dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarPorFilme(@PathVariable Long filmeId) {
        List<AvaliacaoResponseDTO> response = avaliacaoService.listarPorFilme(filmeId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{avaliacaoId}")
    public ResponseEntity<Void> deletar(@PathVariable Long filmeId, @PathVariable Long avaliacaoId, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        avaliacaoService.deletar(avaliacaoId, usuarioLogado);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/listar")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarTodas() {
        List<AvaliacaoResponseDTO> todas = avaliacaoService.listarTodas();
        return ResponseEntity.ok(todas);
    }
}