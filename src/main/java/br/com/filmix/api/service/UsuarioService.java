package br.com.filmix.api.service;

import br.com.filmix.api.dto.usuario.UsuarioRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioResponseDTO;
import br.com.filmix.api.exception.RegraDeNegocioException;
import br.com.filmix.api.mapper.UsuarioMapper;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.repository.UsuarioRepository;
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

}
