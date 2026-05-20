package br.com.filmix.api.mapper;

import br.com.filmix.api.dto.genero.GeneroRequestDTO;
import br.com.filmix.api.dto.genero.GeneroResponseDTO;
import br.com.filmix.api.model.Genero;
import org.springframework.stereotype.Component;

@Component
public class GeneroMapper {

    public Genero toEntity(GeneroRequestDTO dto) {
        Genero genero = new Genero();
        genero.setNome(dto.nome());
        genero.setCor(dto.cor());
        genero.setIcone(dto.icone());
        return genero;
    }

    public GeneroResponseDTO toResponseDTO(Genero entity) {
        return new GeneroResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getCor(),
                entity.getIcone());
    }

}