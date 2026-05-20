package br.com.filmix.api.controller;

import br.com.filmix.api.dto.usuario.AlterarSenhaDTO;
import br.com.filmix.api.dto.usuario.AtualizarUsuarioDTO;
import br.com.filmix.api.dto.usuario.UsuarioRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioResponseDTO;
import br.com.filmix.api.mapper.UsuarioMapper;
import br.com.filmix.api.model.Role;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioMapper usuarioMapper;

    @PostMapping("/registrar")
    public ResponseEntity<UsuarioResponseDTO> registrar(@RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO response = usuarioService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMe(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        UsuarioResponseDTO response = usuarioService.getMe(usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> updateMe(Authentication authentication, @RequestBody @Valid AtualizarUsuarioDTO dto) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        UsuarioResponseDTO response = usuarioService.updateMe(usuarioLogado, dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/alterar-senha")
    public ResponseEntity<?> alterarSenha(Authentication authentication, @RequestBody @Valid AlterarSenhaDTO dto) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        usuarioService.alterarSenha(usuarioLogado, dto);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        usuarioService.deletarConta(usuarioLogado.getId());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        List<Usuario> usuarios = usuarioService.listarTodos();

        List<UsuarioResponseDTO> usuariosDTO = usuarios
                .stream()
                .filter(u -> !u.getId().equals(usuarioLogado.getId()))
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(usuariosDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<Void> alterarRole(@PathVariable Long id, @RequestBody Role novoRole) {
        usuarioService.atualizarRole(id, novoRole);
        return ResponseEntity.noContent().build();
    }


}
