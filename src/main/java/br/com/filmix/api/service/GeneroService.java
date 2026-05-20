package br.com.filmix.api.service;

import br.com.filmix.api.dto.genero.GeneroRequestDTO;
import br.com.filmix.api.dto.genero.GeneroResponseDTO;
import br.com.filmix.api.exception.RecursoNaoEncontradoException;
import br.com.filmix.api.mapper.GeneroMapper;
import br.com.filmix.api.model.Genero;
import br.com.filmix.api.repository.GeneroRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GeneroService {

    private final GeneroRepository generoRepository;
    private final GeneroMapper generoMapper;

    @Transactional
    public GeneroResponseDTO criar(GeneroRequestDTO dto) {
        Genero genero = generoMapper.toEntity(dto);
        generoRepository.save(genero);
        return generoMapper.toResponseDTO(genero);
    }

    @Transactional(readOnly = true)
    public List<GeneroResponseDTO> listarTodos() {
        return generoRepository.findAll()
                .stream()
                .map(generoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GeneroResponseDTO buscarPorId(Long id) {
        Genero genero = generoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Gênero com ID " + id + " não encontrado."));
        return generoMapper.toResponseDTO(genero);
    }

    @Transactional
    public GeneroResponseDTO atualizar(Long id, GeneroRequestDTO dto) {
        Genero genero = generoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Gênero com ID " + id + " não encontrado."));

        genero.setNome(dto.nome());
        genero.setCor(dto.cor());
        genero.setIcone(dto.icone());
        generoRepository.save(genero);

        return generoMapper.toResponseDTO(genero);
    }

    @Transactional
    public void deletar(Long id) {
        if (!generoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Gênero com ID " + id + " não encontrado.");
        }
        generoRepository.deleteById(id);
    }
}