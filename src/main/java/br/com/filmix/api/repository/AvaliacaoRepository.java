package br.com.filmix.api.repository;

import br.com.filmix.api.model.Avaliacao;
import br.com.filmix.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByFilmeId(Long filmeId);
    Optional<Avaliacao> findByUsuarioIdAndFilmeId(Long usuarioId, Long filmeId);
    long countByUsuario(Usuario usuario);
}
