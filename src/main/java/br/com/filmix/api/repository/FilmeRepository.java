package br.com.filmix.api.repository;

import br.com.filmix.api.model.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {
    @Query("SELECT f FROM Filme f LEFT JOIN FETCH f.generos g WHERE f.id = :id")
    Optional<Filme> findByIdWithGeneros(@Param("id") Long id);
}
