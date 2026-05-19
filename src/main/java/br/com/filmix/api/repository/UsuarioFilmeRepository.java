package br.com.filmix.api.repository;

import br.com.filmix.api.model.Filme;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.model.UsuarioFilme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioFilmeRepository extends JpaRepository<UsuarioFilme, Long> {
    boolean existsByUsuarioAndFilme(Usuario usuario, Filme filme);
    boolean existsByUsuarioIdAndFilmeId(Long usuarioId, Long filmeId);
    List<UsuarioFilme> findByUsuarioId(Long usuarioId);
    Optional<UsuarioFilme> findByUsuarioIdAndFilmeId(Long usuarioId, Long filmeId);
    long countByUsuario(Usuario usuario);
    Long countByUsuarioAndVisto(Usuario usuario, boolean visto);
}
