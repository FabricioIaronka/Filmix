package br.com.filmix.api.service;

import br.com.filmix.api.dto.filme.AtualizarStatusRequestDTO;
import br.com.filmix.api.dto.usuario.UsuarioFilmeResponseDTO;
import br.com.filmix.api.exception.RecursoNaoEncontradoException;
import br.com.filmix.api.exception.RegraDeNegocioException;
import br.com.filmix.api.mapper.UsuarioFilmeMapper;
import br.com.filmix.api.model.Filme;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.model.UsuarioFilme;
import br.com.filmix.api.repository.FilmeRepository;
import br.com.filmix.api.repository.UsuarioFilmeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class UsuarioFilmeService {

    private final UsuarioFilmeRepository usuarioFilmeRepository;
    private final FilmeRepository filmeRepository;
    private final UsuarioFilmeMapper usuarioFilmeMapper;

    @Transactional
    public UsuarioFilmeResponseDTO adicionarFilmeNaLista(Long filmeId, Usuario usuarioLogado) {
        Filme filme = filmeRepository.findByIdWithGeneros(filmeId).orElseThrow(() -> new RecursoNaoEncontradoException("Filme com ID " + filmeId + " não encontrado"));

        boolean jaExiste = usuarioFilmeRepository.existsByUsuarioAndFilme(usuarioLogado, filme);
        if (jaExiste) {
            throw new RegraDeNegocioException("Este filme já existe na sua lista");
        }

        UsuarioFilme usuarioFilme = new UsuarioFilme();
        usuarioFilme.setUsuario(usuarioLogado);
        usuarioFilme.setFilme(filme);
        usuarioFilme.setVisto(false);

        usuarioFilmeRepository.save(usuarioFilme);

        return usuarioFilmeMapper.toResponseDTO(usuarioFilme);
    }

    @Transactional(readOnly = true)
    public List<UsuarioFilmeResponseDTO> listarFilmesDoUsuario(Usuario usuarioLogado) {
        List<UsuarioFilme> lista = usuarioFilmeRepository.findByUsuarioId(usuarioLogado.getId());

        return usuarioFilmeMapper.toListResponseDTO(lista);
    }

    @Transactional
    public void removerFilmeDaLista(Long filmeId, Usuario usuarioLogado) {
        UsuarioFilme usuarioFilme = usuarioFilmeRepository.findByUsuarioIdAndFilmeId(usuarioLogado.getId(), filmeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado na lista do usuário"));

        usuarioFilmeRepository.delete(usuarioFilme);
    }

    @Transactional
    public UsuarioFilmeResponseDTO marcarFilmeComoVisto(Long filmeId, AtualizarStatusRequestDTO dto, Usuario usuarioLogado) {
        UsuarioFilme usuarioFilme = usuarioFilmeRepository.findByUsuarioIdAndFilmeId(usuarioLogado.getId(), filmeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado na lista do usuário"));

        usuarioFilme.setVisto(dto.visto());

        return usuarioFilmeMapper.toResponseDTO(usuarioFilme);
    }


}