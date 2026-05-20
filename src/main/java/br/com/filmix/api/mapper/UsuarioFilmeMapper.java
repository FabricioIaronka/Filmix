package br.com.filmix.api.mapper;

import br.com.filmix.api.dto.usuario.UsuarioFilmeResponseDTO;
import br.com.filmix.api.model.UsuarioFilme;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class UsuarioFilmeMapper {

    private final FilmeMapper filmeMapper;

    public UsuarioFilmeResponseDTO toResponseDTO(UsuarioFilme entity) {
        return new UsuarioFilmeResponseDTO(
                filmeMapper.toResponseDTO(entity.getFilme()),
                entity.isVisto()
        );
    }

    public List<UsuarioFilmeResponseDTO> toListResponseDTO(List<UsuarioFilme> entities) {
        return entities.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

}