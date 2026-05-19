package br.com.filmix.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "genero")
public class Genero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", length = 100, unique = true, nullable = false)
    private String nome;

    @Column
    private String cor;

    @Column
    private String icone;

    @ManyToMany(mappedBy = "generos")
    private Set<Filme> filmes;

}
