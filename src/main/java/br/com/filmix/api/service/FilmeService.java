package br.com.filmix.api.service;

import br.com.filmix.api.dto.filme.FilmeRequestDTO;
import br.com.filmix.api.dto.filme.FilmeResponseDTO;
import br.com.filmix.api.exception.RecursoNaoEncontradoException;
import br.com.filmix.api.mapper.FilmeMapper;
import br.com.filmix.api.model.Filme;
import br.com.filmix.api.model.Genero;
import br.com.filmix.api.repository.FilmeRepository;
import br.com.filmix.api.repository.GeneroRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FilmeService {

    private final FilmeRepository filmeRepository;
    private final GeneroRepository generoRepository;
    private final FilmeMapper filmeMapper;

    @Transactional
    public FilmeResponseDTO criar(FilmeRequestDTO dto) {
        Filme filme = filmeMapper.toEntity(dto);

        Set<Genero> generos = new HashSet<>(generoRepository.findAllById(dto.generoIds()));
        if (generos.size() != dto.generoIds().size()) {
            throw new RecursoNaoEncontradoException("Um ou mais IDs de gênero não foram encontrados");
        }
        filme.setGeneros(generos);

        filmeRepository.save(filme);
        return filmeMapper.toResponseDTO(filme);
    }

    @Transactional(readOnly = true)
    public List<FilmeResponseDTO> listarTodos() {
        return filmeRepository.findAll()
                .stream()
                .map(filmeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FilmeResponseDTO buscarPorId(Long id) {
        Filme filme = filmeRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Filme com ID " + id + " não encontrado"));
        return filmeMapper.toResponseDTO(filme);
    }

    @Transactional
    public FilmeResponseDTO atualizar(Long id, FilmeRequestDTO dto) {
        Filme filme = filmeRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Filme com ID " + id + " não encontrado"));

        filme.setTitulo(dto.titulo());
        filme.setSinopse(dto.sinopse());
        filme.setDiretor(dto.diretor());
        filme.setAnoLancamento(dto.anoLancamento());
        filme.setFotoFilme(dto.fotoFilme());

        Set<Genero> generos = new HashSet<>(generoRepository.findAllById(dto.generoIds()));
        if (generos.size() != dto.generoIds().size()) {
            throw new RecursoNaoEncontradoException("Um ou mais IDs de gênero não foram encontrados");
        }
        filme.setGeneros(generos);

        filmeRepository.save(filme);
        return filmeMapper.toResponseDTO(filme);
    }

    @Transactional
    public void deletar(Long id) {
        if (!filmeRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Filme com ID " + id + " não encontrado");
        }
        filmeRepository.deleteById(id);
    }

}