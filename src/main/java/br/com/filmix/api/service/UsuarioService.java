package br.com.filmix.api.service;

import br.com.filmix.api.dto.usuario.AtualizarUsuarioDTO;
import br.com.filmix.api.dto.usuario.UsuarioRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioResponseDTO;
import br.com.filmix.api.exception.RegraDeNegocioException;
import br.com.filmix.api.mapper.UsuarioMapper;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UsuarioService {


    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;


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
}
