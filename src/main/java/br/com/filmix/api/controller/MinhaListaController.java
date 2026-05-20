package br.com.filmix.api.controller;

import br.com.filmix.api.dto.filme.AtualizarStatusRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioFilmeResponseDTO;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.service.UsuarioFilmeService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/minha-lista")
@AllArgsConstructor
public class MinhaListaController {

    private final UsuarioFilmeService usuarioFilmeService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/filmes/{filmeId}")
    public ResponseEntity<UsuarioFilmeResponseDTO> adicionarFilmeNaLista(@PathVariable Long filmeId, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        UsuarioFilmeResponseDTO response = usuarioFilmeService.adicionarFilmeNaLista(filmeId, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<UsuarioFilmeResponseDTO>> listarFilmesDoUsuario(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        List<UsuarioFilmeResponseDTO> response = usuarioFilmeService.listarFilmesDoUsuario(usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/filmes/{filmeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerFilmeDaLista(@PathVariable Long filmeId, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        usuarioFilmeService.removerFilmeDaLista(filmeId, usuarioLogado);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/filmes/{filmeId}/status")
    public ResponseEntity<UsuarioFilmeResponseDTO> marcarFilmeComoVisto(@PathVariable Long filmeId, @RequestBody @Valid AtualizarStatusRequestDTO dto, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        UsuarioFilmeResponseDTO response = usuarioFilmeService.marcarFilmeComoVisto(filmeId, dto, usuarioLogado);
        return ResponseEntity.ok(response);
    }

}