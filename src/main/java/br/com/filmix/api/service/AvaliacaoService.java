package br.com.filmix.api.service;

import br.com.filmix.api.dto.avaliacao.AvaliacaoRequestDTO;
import br.com.filmix.api.dto.avaliacao.AvaliacaoResponseDTO;
import br.com.filmix.api.exception.RecursoNaoEncontradoException;
import br.com.filmix.api.exception.RegraDeNegocioException;
import br.com.filmix.api.mapper.AvaliacaoMapper;
import br.com.filmix.api.model.Avaliacao;
import br.com.filmix.api.model.Filme;
import br.com.filmix.api.model.Role;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.repository.AvaliacaoRepository;
import br.com.filmix.api.repository.FilmeRepository;
import br.com.filmix.api.repository.UsuarioFilmeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final FilmeRepository filmeRepository;
    private final AvaliacaoMapper avaliacaoMapper;
    private final UsuarioFilmeRepository usuarioFilmeRepository;

    @Transactional
    public AvaliacaoResponseDTO criar(Long filmeId, AvaliacaoRequestDTO dto, Usuario usuarioLogado) {
        Filme filme = filmeRepository.findById(filmeId).orElseThrow(() -> new RecursoNaoEncontradoException("Filme com ID " + filmeId + " não encontrado"));

        Avaliacao avaliacao = avaliacaoRepository.findByUsuarioIdAndFilmeId(usuarioLogado.getId(), filmeId)
                                                 .orElse(null);

        if (avaliacao == null) {
            avaliacao = avaliacaoMapper.toEntity(dto);
            avaliacao.setFilme(filme);
            avaliacao.setUsuario(usuarioLogado);
        }
        avaliacao.setNota(dto.nota());
        avaliacao.setComentario(dto.comentario());

        avaliacaoRepository.save(avaliacao);
        return avaliacaoMapper.toResponseDTO(avaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarPorFilme(Long filmeID) {
        if (!filmeRepository.existsById(filmeID)) {
            throw new RecursoNaoEncontradoException("Filme com ID " + filmeID + " não encontrado");
        }

        List<Avaliacao> avaliacoes = avaliacaoRepository.findByFilmeId(filmeID);
        return avaliacoes.stream()
                .map(avaliacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long avaliacaoId, Usuario usuarioLogado) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId).orElseThrow(() -> new RecursoNaoEncontradoException("Avaliação com ID " + avaliacaoId + " não encontrada"));

        if (usuarioLogado.getRole().equals(Role.ADMIN)) {
            avaliacaoRepository.delete(avaliacao);
            return;
        }

        if (!avaliacao.getUsuario().getId().equals(usuarioLogado.getId())) {
            throw new RegraDeNegocioException("Usuário não tem permissão para deletar esta avaliação");
        }

        avaliacaoRepository.delete(avaliacao);
    }

    public List<AvaliacaoResponseDTO> listarTodas() {
        return avaliacaoRepository.findAll()
                .stream()
                .map(avaliacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

}