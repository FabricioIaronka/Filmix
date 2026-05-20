package br.com.filmix.api.service;

import br.com.filmix.api.dto.usuario.AlterarSenhaDTO;
import br.com.filmix.api.dto.usuario.AtualizarUsuarioDTO;
import br.com.filmix.api.dto.usuario.UsuarioRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioResponseDTO;
import br.com.filmix.api.exception.RegraDeNegocioException;
import br.com.filmix.api.mapper.UsuarioMapper;
import br.com.filmix.api.model.Role;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.AuthenticationException;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UsuarioService {


    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    @Transactional
    public UsuarioResponseDTO registrar(UsuarioRequestDTO dto) {
        if (usuarioRepository.findByEmail(dto.email()).isPresent()) {
            throw new RegraDeNegocioException("O email informado já está em uso");
        }

        Usuario usuario = usuarioMapper.toEntity(dto);

        String senhaCriptografada = passwordEncoder.encode(dto.senha());
        usuario.setSenhaHash(senhaCriptografada);

        usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(usuario);
    }

    public UsuarioResponseDTO getMe(Usuario usuarioLogado) {
        return usuarioMapper.toResponseDTO(usuarioLogado);
    }

    @Transactional
    public UsuarioResponseDTO updateMe(Usuario usuarioLogado, AtualizarUsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        if (!dto.email().equals(usuario.getEmail()) && usuarioRepository.findByEmail(dto.email()).isPresent()) {
            throw new RegraDeNegocioException("Este email já está em uso.");
        }

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setFotoPerfil(dto.fotoPerfil());

        return usuarioMapper.toResponseDTO(usuario);
    }


    @Transactional
    public void alterarSenha(Usuario usuarioLogado, AlterarSenhaDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(usuario.getEmail(), dto.senhaAntiga());
            authenticationManager.authenticate(authenticationToken);
        } catch (AuthenticationException e) {
            throw new RegraDeNegocioException("Senha antiga incorreta.");
        }

        if (passwordEncoder.matches(dto.senhaNova(), usuario.getSenhaHash())) {
            throw new RegraDeNegocioException("A nova senha não pode ser igual à senha antiga.");
        }

        String novaSenhaHash = passwordEncoder.encode(dto.senhaNova());
        usuario.setSenhaHash(novaSenhaHash);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public void atualizarRole(Long id, Role novoRole) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com id: " + id));

        usuario.setRole(novoRole);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletarConta(Long id) {
        usuarioRepository.deleteById(id);
    }
}
