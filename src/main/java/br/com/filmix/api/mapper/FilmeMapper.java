package br.com.filmix.api.mapper;

import br.com.filmix.api.dto.filme.FilmeRequestDTO;
import br.com.filmix.api.dto.filme.FilmeResponseDTO;
import br.com.filmix.api.model.Filme;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class FilmeMapper {

    private final GeneroMapper generoMapper;

    public Filme toEntity(FilmeRequestDTO dto) {
        Filme filme = new Filme();
        filme.setTitulo(dto.titulo());
        filme.setSinopse(dto.sinopse());
        filme.setDiretor(dto.diretor());
        filme.setAnoLancamento(dto.anoLancamento());
        filme.setFotoFilme(dto.fotoFilme());
        return filme;
    }

    public FilmeResponseDTO toResponseDTO(Filme entity) {
        return new FilmeResponseDTO(
                entity.getId(),
                entity.getTitulo(),
                entity.getSinopse(),
                entity.getDiretor(),
                entity.getAnoLancamento(),
                entity.getFotoFilme(),
                entity.getGeneros().stream()
                        .map(generoMapper::toResponseDTO)
                        .collect(Collectors.toSet())
        );
    }


}